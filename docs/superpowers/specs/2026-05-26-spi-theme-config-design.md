# Theme Config SPI — Design (Phase 1)

**Date:** 2026-05-26
**Status:** Approved for implementation
**Scope:** Phase 1 only — Java SPI exposing realm theme attributes via REST, plus theme-side fetch + cache integration. **Out of scope: Keycloak Admin UI extension** (separate spec/branch later).

## Problem

The dynamic logo feature merged into `main` reads from `kcContext.realm.displayNameHtml`. This works but overloads a field intended for the realm's HTML display name. Admins typing logo config into "Display name HTML" causes the URL to render as text on Keycloak's default theme and tangles two unrelated concerns (display name + branding).

We also discovered during smoke testing that other candidate runtime mechanisms in Keycloakify v11 + Keycloak 26 do not work:
- **Realm Localization Messages** — `kcContext.msg` is not present at all in this version; `i18n.advancedMsgStr` only reads static `.ts` message files, never realm-set messages.
- **Realm attributes via vanilla kcContext** — `kcContext.realm.realmAttributes` is `undefined`; attributes are stored server-side but not serialised to the theme.

The natural Keycloak-native storage for per-realm custom config is `realm.attributes` (`Map<String, String>`). It already exists at the Keycloak data model level. We just need a way to surface it to the unauthenticated login page JS.

## Goals

1. Generic per-realm key-value config readable at runtime from the theme, no theme rebuild required.
2. Admin can update values without restarting Keycloak (admin REST API is sufficient for Phase 1).
3. Security: only attributes with a documented prefix (`theme.`) are exposed publicly; admin cannot accidentally leak sensitive realm attributes.
4. Coexistence with the existing `displayNameHtml` mechanism — new SPI takes priority, displayNameHtml is the fallback. No regression for users who already configured their realm with `displayNameHtml`.
5. Ships as part of the keycloakify-starter template — clones get both theme JAR and SPI JAR from one build command.

## Non-goals

- **Keycloak Admin UI extension** (Phase 2 — separate spec). For Phase 1, admins use the standard Keycloak Admin REST API (`PATCH /admin/realms/{realm}` with `attributes` body).
- Multi-realm aggregation, cross-realm config sharing — each realm has its own attributes.
- Schema validation of theme config values beyond URL-shape (matches the displayNameHtml parser's posture).
- Built-in cache invalidation on admin write — the theme caches with a short TTL (5 minutes); for instant propagation, admin clears localStorage or waits.
- Removal of the existing `displayNameHtml` mechanism — coexistence is intentional. Deprecation is a future decision once SPI adoption is verified.
- Support for Keycloak versions below 26 — Phase 1 targets the current Keycloak 26.x major. The starter's other Keycloak version JARs continue to ship the theme; the SPI is single-target.

## Architecture

Two artifacts produced by `npm run build-keycloak-theme`, both deployed to Keycloak's `providers/` directory:

```
┌─────────────────────────┐     ┌──────────────────────────┐
│  Keycloak Admin         │     │  Login / Account theme   │
│  (admin REST API)       │     │  (Keycloakify React)     │
│                         │     │                          │
│  PATCH /admin/realms/X  │     │  GET /realms/X/          │
│    attributes: {        │     │       theme-config       │
│      "theme.logoLight": │     │                          │
│      "https://..."      │     │                          │
│    }                    │     │                          │
└─────────────────────────┘     └──────────────────────────┘
            │                              ▲
            ▼                              │
  ┌──────────────────────────────────────────────────────┐
  │              Keycloak server                         │
  │  ┌─────────────────┐    ┌──────────────────────────┐ │
  │  │ realm attrs map │    │  ThemeConfigSPI (Java)   │ │
  │  │ (built-in)      │◄───┤  RealmResourceProvider   │ │
  │  └─────────────────┘    │  /theme-config           │ │
  │                         │  filter theme.* keys     │ │
  │                         │  strip prefix, JSON out  │ │
  │                         └──────────────────────────┘ │
  └──────────────────────────────────────────────────────┘
```

## Component 1 — Java SPI

### Repo location

```
keycloakify-starter/
├── spi/                          ← NEW Maven module
│   ├── pom.xml
│   └── src/main/
│       ├── java/dev/emirman/keycloak/themeconfig/
│       │   ├── ThemeConfigResourceProviderFactory.java
│       │   └── ThemeConfigResourceProvider.java
│       └── resources/META-INF/services/
│           └── org.keycloak.services.resource.RealmResourceProviderFactory
├── src/                          ← Existing theme (TS/React)
├── package.json
└── ...
```

### `pom.xml`

- `<packaging>jar</packaging>`
- Dependencies (all `provided` — Keycloak runtime supplies them):
    - `org.keycloak:keycloak-server-spi`
    - `org.keycloak:keycloak-server-spi-private`
    - `org.keycloak:keycloak-services`
- Keycloak version: matches the starter's `package.json` (currently targeting 26.x).
- Java target: 17 (Keycloak 26's baseline).
- Output: `spi/target/theme-config-spi-<version>.jar`, copied to `dist_keycloak/` by the build script.

### `ThemeConfigResourceProviderFactory.java`

Implements `org.keycloak.services.resource.RealmResourceProviderFactory`:

- `getId()` returns `"theme-config"` — this becomes the URL segment: `/realms/{realm}/theme-config`.
- `create(KeycloakSession)` returns a new `ThemeConfigResourceProvider(session)`.
- `init`, `postInit`, `close` are no-ops.

### `ThemeConfigResourceProvider.java`

Implements `org.keycloak.services.resource.RealmResourceProvider`:

```java
private static final String PREFIX = "theme.";

@GET
@Path("/")
@Produces(MediaType.APPLICATION_JSON)
public Response getThemeConfig() {
    RealmModel realm = session.getContext().getRealm();
    if (realm == null) {
        return Response.status(Response.Status.NOT_FOUND).build();
    }

    Map<String, String> filtered = realm.getAttributes().entrySet().stream()
        .filter(e -> e.getKey() != null && e.getKey().startsWith(PREFIX))
        .filter(e -> e.getValue() != null && !e.getValue().isEmpty())
        .collect(Collectors.toMap(
            e -> e.getKey().substring(PREFIX.length()),
            Map.Entry::getValue
        ));

    return Response
        .ok(filtered)
        .header("Cache-Control", "public, max-age=300")
        .build();
}

@Override public Object getResource() { return this; }
@Override public void close() { }
```

### Service registration

`spi/src/main/resources/META-INF/services/org.keycloak.services.resource.RealmResourceProviderFactory` contains one line:
```
dev.emirman.keycloak.themeconfig.ThemeConfigResourceProviderFactory
```

### Endpoint behaviour

| Aspect | Decision |
|---|---|
| URL | `GET /realms/{realm}/theme-config` |
| Auth | **Public** — required because login page is pre-authentication |
| Request body | None |
| Response 200 | JSON object, prefix-stripped keys: `{"logoLight":"https://...","logoDark":"...","faviconUrl":"...","customColour":"#abc",...}` |
| Response 404 | Realm not found (URL contains an unknown realm) |
| Response 200 + `{}` | Realm exists but has no `theme.*` attributes |
| `Cache-Control` | `public, max-age=300` (5 minutes) |
| CORS | None added — same-origin assumed (theme served by Keycloak) |
| Filtering | Keys: starts with `theme.` and non-empty value. Empty values are dropped. Non-`theme.` keys are invisible. |

## Component 2 — Theme integration

### New files

```
src/lib/
├── themeConfig.ts         ← Pure logic: types, cache, fetch
└── useThemeConfig.ts      ← React hook: state + effect
```

### `themeConfig.ts`

```ts
export type ThemeConfig = Record<string, string>;

const CACHE_KEY = "kc-theme-config";
const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = { realm: string; data: ThemeConfig; ts: number };

export function readCache(realm: string): ThemeConfig | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const entry = JSON.parse(raw) as CacheEntry;
        if (entry.realm !== realm) return null;
        if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
        return entry.data;
    } catch {
        return null;
    }
}

export function writeCache(realm: string, data: ThemeConfig): void {
    try {
        const entry: CacheEntry = { realm, data, ts: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {
        // Silently swallow: Safari private mode, quota, etc.
    }
}

export async function fetchThemeConfig(realmName: string): Promise<ThemeConfig> {
    const url = `/realms/${encodeURIComponent(realmName)}/theme-config`;
    const res = await fetch(url, { credentials: "omit" });
    if (!res.ok) throw new Error(`theme-config ${res.status}`);
    return res.json();
}
```

### `useThemeConfig.ts`

```ts
import { useEffect, useState } from "react";
import { fetchThemeConfig, readCache, writeCache, type ThemeConfig } from "./themeConfig";

export function useThemeConfig(realmName: string): ThemeConfig {
    const [config, setConfig] = useState<ThemeConfig>(
        () => readCache(realmName) ?? {}
    );

    useEffect(() => {
        let cancelled = false;
        fetchThemeConfig(realmName)
            .then(data => {
                if (cancelled) return;
                setConfig(data);
                writeCache(realmName, data);
            })
            .catch(() => {
                // SPI missing / outage — keep previous cache, fall back via priority chain
            });
        return () => { cancelled = true; };
    }, [realmName]);

    return config;
}
```

### Logo / favicon priority chain

`<Logo />` receives `themeConfig` as a new prop alongside the existing `kcContext` (for displayNameHtml fallback) and `getResourcePath`. The source resolution becomes:

```
lightSrc = themeConfig.logoLight
        ?? parseRealmLogoConfig(kcContext.realm.displayNameHtml).light
        ?? getResourcePath(defaultLight)

darkSrc  = themeConfig.logoDark
        ?? themeConfig.logoLight
        ?? parseRealmLogoConfig(kcContext.realm.displayNameHtml).dark
        ?? parseRealmLogoConfig(kcContext.realm.displayNameHtml).light
        ?? getResourcePath(defaultDark ?? defaultLight)
```

`useFavicon` similarly checks `themeConfig.faviconUrl` first, then falls back to the displayNameHtml-derived favicon, then leaves the bundled favicon untouched.

### Where `useThemeConfig` is called

Each theme's `PageWrapper` calls `useThemeConfig(kcContext.realm.name)` once and threads the resulting `themeConfig` down to `<Logo />` and into `useFavicon` via the same call site. `PageWrapper` is the single source of truth to avoid the double-hook divergence problem we hit during the localization-messages experiment.

### URL construction

`fetchThemeConfig` constructs a **relative** URL: `/realms/{realm}/theme-config`. The login page is always served by the same Keycloak origin, so no base URL parameter is needed. No CORS, no host detection.

## Build pipeline

Update `package.json`:

```json
{
  "scripts": {
    "build-keycloak-theme": "npm run build && keycloakify build && npm run build-spi",
    "build-spi": "node scripts/build-spi.mjs"
  }
}
```

A new `scripts/build-spi.mjs` shells out to Maven and copies the artifact — cross-platform via Node's `fs` and `child_process`:

```js
import { execFileSync } from "node:child_process";
import { copyFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const spiDir = new URL("../spi/", import.meta.url).pathname;
const distDir = new URL("../dist_keycloak/", import.meta.url).pathname;

execFileSync("mvn", ["-B", "clean", "package"], { cwd: spiDir, stdio: "inherit" });

if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

const target = join(spiDir, "target");
const jar = readdirSync(target).find(f => f.endsWith(".jar") && !f.endsWith("-sources.jar"));
if (!jar) throw new Error("SPI JAR not produced");

copyFileSync(join(target, jar), join(distDir, "theme-config-spi.jar"));
console.log(`Copied ${jar} → dist_keycloak/theme-config-spi.jar`);
```

After running `npm run build-keycloak-theme`, `dist_keycloak/` contains:
- `keycloak-shadcn-*.jar` (theme, multiple version targets — existing behaviour)
- `theme-config-spi.jar` (new — single target, Keycloak 26.x)

Admin deploys both to Keycloak's `providers/` directory and restarts.

**Prerequisite:** Maven on PATH. The starter already requires Maven for the theme build, so no new prerequisite.

## Error handling

### SPI

| Scenario | Behaviour |
|---|---|
| Realm not found | `404` |
| Realm has no `theme.*` attributes | `200` with `{}` |
| Attribute has empty value | Dropped from response |
| Non-`theme.` attribute | Invisible (not in response) |
| Underlying Keycloak exception | Keycloak's default error handler produces a 500; theme treats it like a network failure |

### Theme

| Scenario | Behaviour |
|---|---|
| `localStorage` unavailable (Safari private, quota) | `readCache`/`writeCache` swallow exception; fetch still runs every page load (no caching) |
| Corrupted cache JSON | `JSON.parse` throws → null returned → initial render uses default → fetch overwrites |
| Cache belongs to a different realm | `entry.realm !== realm` → null → fresh fetch |
| Cache expired (>5 min) | null → fresh fetch; if fetch fails the cache is NOT cleared (avoid blanking a previously-working logo on a transient outage) |
| SPI not deployed (404) | `fetchThemeConfig` rejects; `.catch` is silent; cached value (if any) persists; falls back to `displayNameHtml` parser; ultimately bundled default |
| Network failure | Same as above — silent fallback chain |
| Fetch response is not JSON | `res.json()` rejects → caught → fallback chain |
| `theme.logoLight` value is malformed (not a URL) | `<Logo>` renders it, `<img onError>` triggers, fallback to default |
| Component unmounts mid-fetch | `cancelled` flag prevents `setState` |

### Console output

No `console.error`, no `console.warn`. The login page console stays clean. Errors are silent and the user sees the appropriate fallback.

## Testing

No new test runner. Verification via:

1. **Storybook story variants** — new stories seed `localStorage` directly before rendering `<KcPageStory>`:
    - `Login.stories.tsx::WithSPILogo` — seed cache with `logoLight` placeholder URL
    - `Login.stories.tsx::WithSPIFavicon` — seed cache with `faviconUrl`
    - `Register.stories.tsx::WithSPILogo` — same pattern
    - `Account.stories.tsx::WithSPILogo`, `Account.stories.tsx::WithSPIFavicon` — same
    
    Fetch will fail in Storybook (no Keycloak), but seeded cache renders correctly.

2. **Dev-mode manual test** — uncomment `getKcContextMock` in `src/main.tsx`, set `kcContext.realm.name`, seed `localStorage` from DevTools, run `npm run dev`, verify in browser.

3. **Real-Keycloak smoke test (release gate before merging Phase 1)**:
    1. `npm run build-keycloak-theme` produces both JARs in `dist_keycloak/`.
    2. Deploy both JARs to a local Keycloak 26.x (Docker recommended).
    3. Set realm attribute via admin REST:
        ```bash
        curl -X PATCH http://localhost:8080/admin/realms/master \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{"attributes":{"theme.logoLight":"https://placehold.co/200x80"}}'
        ```
    4. Verify endpoint: `curl http://localhost:8080/realms/master/theme-config` returns `{"logoLight":"https://placehold.co/200x80"}`.
    5. Open the realm's login page:
        - First visit: brief default-logo flash, then SPI logo appears.
        - Reload: instant SPI logo from cache.
        - Network tab: `/realms/master/theme-config` returns 200.
        - Application > LocalStorage: `kc-theme-config` entry present.
    6. Account console: same checks.
    7. Remove the SPI JAR, restart Keycloak. Login page should fall back: `displayNameHtml` if set, else bundled default.

## Follow-ups (Phase 2 and beyond)

- **Phase 2 — Keycloak Admin UI extension**: add a "Theme Config" tab/section to Realm Settings in the Keycloak admin console. Replaces the curl-based admin workflow with a friendly key/value editor. Separate spec, separate branch.
- **Deprecation of `displayNameHtml` mechanism**: after SPI is verified in real-world use, the displayNameHtml priority can be removed from the Logo priority chain. Until then, coexistence is intentional and documented.
- **SPI multi-Keycloak-version support**: Phase 1 ships one SPI JAR targeted at Keycloak 26.x. If older Keycloak deployments need it, additional Maven profiles can be added (similar to the theme's per-Keycloak-version JARs).
- **Schema for theme config**: a `theme.schema.json` shipped with the SPI describing well-known keys (`logoLight`, `logoDark`, `faviconUrl`, etc.) for admin tooling to validate against. Useful once Phase 2 admin UI exists.
