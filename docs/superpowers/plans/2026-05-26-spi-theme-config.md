# Theme Config SPI Implementation Plan (Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Java Keycloak SPI that exposes `theme.*` realm attributes via a public REST endpoint, plus theme-side fetch + localStorage cache, replacing the displayNameHtml hack with a clean mechanism while keeping displayNameHtml as a fallback.

**Architecture:** Two artifacts produced from one repo. A new Maven module under `/spi/` builds a Keycloak `RealmResourceProvider` JAR. The React theme adds a `useThemeConfig` hook called from each `PageWrapper`; the result is provided via React Context to `<Logo />` and `useFavicon`, which consult `themeConfig.logoLight` / `logoDark` / `faviconUrl` first, then fall back to the existing `displayNameHtml` parser, then to bundled defaults.

**Tech Stack:** Java 17 + Maven (Keycloak SPI side) · React 18 + TypeScript + Vite (theme side) · Tailwind CSS · Storybook 10 for visual verification · no separate test runner (visual + storybook + manual smoke).

**Spec:** `docs/superpowers/specs/2026-05-26-spi-theme-config-design.md`

---

## Pre-flight (run once before Task 1)

- Verify Java 17 and Maven on PATH:

  ```bash
  java -version    # expect 17+
  mvn --version    # expect 3.6+
  ```

  If either is missing, install before continuing. README already requires Maven for theme build.

- Create a feature branch from `main`:

  ```bash
  cd D:/projects/emirman.dev/keycloakify-starter
  git checkout main
  git checkout -b feat/theme-config-spi
  ```

---

## File Structure

**Create:**
- `spi/pom.xml`
- `spi/src/main/java/dev/emirman/keycloak/themeconfig/ThemeConfigResourceProviderFactory.java`
- `spi/src/main/java/dev/emirman/keycloak/themeconfig/ThemeConfigResourceProvider.java`
- `spi/src/main/resources/META-INF/services/org.keycloak.services.resource.RealmResourceProviderFactory`
- `scripts/build-spi.mjs`
- `src/lib/themeConfig.ts`
- `src/lib/useThemeConfig.ts`
- `src/lib/themeConfigContext.tsx`

**Modify:**
- `package.json` (add `build-spi` script + chain into `build-keycloak-theme`)
- `.gitignore` (ignore `spi/target/`)
- `src/components/Logo.tsx` (consume themeConfig from context, add priority chain)
- `src/lib/useFavicon.ts` (consume themeConfig, add priority chain)
- `src/login/components/PageWrapper.tsx` (call useThemeConfig, wrap children with provider)
- `src/account/components/PageWrapper.tsx` (same)
- `src/login/pages/Login.stories.tsx` (add WithSPILogo, WithSPIFavicon)
- `src/login/pages/Register.stories.tsx` (add WithSPILogo)
- `src/account/pages/Account.stories.tsx` (add WithSPILogo, WithSPIFavicon)
- `README.md` (rewrite Dynamic Logo section: SPI as primary mechanism, displayNameHtml as legacy fallback)

---

## Task 1: Java SPI module

**Files:**
- Create: `spi/pom.xml`
- Create: `spi/src/main/java/dev/emirman/keycloak/themeconfig/ThemeConfigResourceProviderFactory.java`
- Create: `spi/src/main/java/dev/emirman/keycloak/themeconfig/ThemeConfigResourceProvider.java`
- Create: `spi/src/main/resources/META-INF/services/org.keycloak.services.resource.RealmResourceProviderFactory`

- [ ] **Step 1: Create `spi/pom.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>dev.emirman.keycloak</groupId>
    <artifactId>theme-config-spi</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>Keycloakify Theme Config SPI</name>
    <description>Public REST endpoint exposing realm theme.* attributes to the theme.</description>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <keycloak.version>26.0.0</keycloak.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.keycloak</groupId>
            <artifactId>keycloak-server-spi</artifactId>
            <version>${keycloak.version}</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.keycloak</groupId>
            <artifactId>keycloak-server-spi-private</artifactId>
            <version>${keycloak.version}</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.keycloak</groupId>
            <artifactId>keycloak-services</artifactId>
            <version>${keycloak.version}</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>jakarta.ws.rs</groupId>
            <artifactId>jakarta.ws.rs-api</artifactId>
            <version>3.1.0</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>theme-config-spi</finalName>
        <plugins>
            <plugin>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.3.0</version>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 2: Create the factory class**

`spi/src/main/java/dev/emirman/keycloak/themeconfig/ThemeConfigResourceProviderFactory.java`:

```java
package dev.emirman.keycloak.themeconfig;

import org.keycloak.Config;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.services.resource.RealmResourceProvider;
import org.keycloak.services.resource.RealmResourceProviderFactory;

public class ThemeConfigResourceProviderFactory implements RealmResourceProviderFactory {

    public static final String ID = "theme-config";

    @Override
    public String getId() {
        return ID;
    }

    @Override
    public RealmResourceProvider create(KeycloakSession session) {
        return new ThemeConfigResourceProvider(session);
    }

    @Override
    public void init(Config.Scope config) {
    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {
    }

    @Override
    public void close() {
    }
}
```

- [ ] **Step 3: Create the resource provider class**

`spi/src/main/java/dev/emirman/keycloak/themeconfig/ThemeConfigResourceProvider.java`:

```java
package dev.emirman.keycloak.themeconfig;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.services.resource.RealmResourceProvider;

import java.util.Map;
import java.util.stream.Collectors;

public class ThemeConfigResourceProvider implements RealmResourceProvider {

    private static final String PREFIX = "theme.";
    private final KeycloakSession session;

    public ThemeConfigResourceProvider(KeycloakSession session) {
        this.session = session;
    }

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

    @Override
    public Object getResource() {
        return this;
    }

    @Override
    public void close() {
    }
}
```

- [ ] **Step 4: Register the factory via Java SPI service file**

`spi/src/main/resources/META-INF/services/org.keycloak.services.resource.RealmResourceProviderFactory` (single line, no trailing newline issue):

```
dev.emirman.keycloak.themeconfig.ThemeConfigResourceProviderFactory
```

- [ ] **Step 5: Build the SPI**

```bash
cd spi
mvn -B clean package
```

Expected: `BUILD SUCCESS`, artifact at `spi/target/theme-config-spi.jar` (~5–20 KB).

If build fails with "cannot find symbol" on Keycloak classes, verify the `<keycloak.version>` in pom.xml matches a publicly-available version on Maven Central. Adjust if necessary.

- [ ] **Step 6: Commit**

```bash
cd D:/projects/emirman.dev/keycloakify-starter
git add spi/
git commit -m "feat(spi): add theme-config Keycloak SPI

New Maven module under /spi/ exposing realm theme.* attributes via a
public REST endpoint at /realms/{realm}/theme-config. Returns prefix-
stripped JSON with a 5-minute Cache-Control."
```

---

## Task 2: Build pipeline integration

**Files:**
- Create: `scripts/build-spi.mjs`
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create `scripts/build-spi.mjs`**

```js
import { execFileSync } from "node:child_process";
import { copyFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const spiDir = join(repoRoot, "spi");
const targetDir = join(spiDir, "target");
const distDir = join(repoRoot, "dist_keycloak");

console.log(`[build-spi] mvn -B clean package (in ${spiDir})`);
execFileSync("mvn", ["-B", "clean", "package"], {
    cwd: spiDir,
    stdio: "inherit",
    shell: process.platform === "win32",
});

if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
}

const candidates = readdirSync(targetDir).filter(
    f => f.endsWith(".jar") && !f.endsWith("-sources.jar")
);
if (candidates.length === 0) {
    throw new Error(`[build-spi] no JAR found in ${targetDir}`);
}
const jar = candidates[0];

const dest = join(distDir, "theme-config-spi.jar");
copyFileSync(join(targetDir, jar), dest);
console.log(`[build-spi] copied ${jar} → dist_keycloak/theme-config-spi.jar`);
```

- [ ] **Step 2: Update `package.json` scripts**

Find the `"scripts"` block and replace the `build-keycloak-theme` line, plus add `build-spi`:

```json
{
    "scripts": {
        "dev": "vite",
        "build": "tsc && vite build",
        "build-keycloak-theme": "npm run build && keycloakify build && npm run build-spi",
        "build-spi": "node scripts/build-spi.mjs",
        "storybook": "storybook dev -p 6006",
        "format": "prettier . --write"
    }
}
```

- [ ] **Step 3: Update `.gitignore`**

Append to existing `.gitignore`:

```
# Java SPI build output
spi/target/
```

- [ ] **Step 4: Verify the chained build**

```bash
cd D:/projects/emirman.dev/keycloakify-starter
npm run build-keycloak-theme
```

Expected output ends with:
- `Built theme JARs ... keycloak-shadcn-*.jar`
- `[build-spi] mvn -B clean package`
- `[build-spi] copied theme-config-spi.jar → dist_keycloak/theme-config-spi.jar`

Confirm: `ls dist_keycloak/*.jar` lists both the theme JARs and `theme-config-spi.jar`.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-spi.mjs package.json .gitignore
git commit -m "build: chain SPI Maven build into build-keycloak-theme

scripts/build-spi.mjs invokes mvn -B clean package in /spi and copies
the resulting JAR into dist_keycloak/. Hooked into the existing
build-keycloak-theme npm script so one command produces both
artifacts."
```

---

## Task 3: Theme config types, cache, and fetch

**Files:**
- Create: `src/lib/themeConfig.ts`

- [ ] **Step 1: Create the file**

`src/lib/themeConfig.ts`:

```ts
/**
 * Realm theme config loaded from the Theme Config SPI
 * (`/realms/{realm}/theme-config`). Keys are the well-known names with the
 * `theme.` prefix stripped — e.g. `logoLight`, `logoDark`, `faviconUrl`, plus
 * any other `theme.*` attribute the admin sets on the realm.
 */
export type ThemeConfig = Record<string, string>;

const CACHE_KEY = "kc-theme-config";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — matches SPI Cache-Control

type CacheEntry = { realm: string; data: ThemeConfig; ts: number };

/**
 * Reads a fresh cache entry for the given realm. Returns null if the cache is
 * absent, belongs to a different realm, expired, or unparseable. All errors
 * (Safari private mode, JSON parse failures) are swallowed.
 */
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
        // QuotaExceeded, private mode, etc. — silent
    }
}

/**
 * Fetches the realm theme config from the SPI. Uses a relative URL — login
 * pages are always served from the same Keycloak origin, so no base URL or
 * CORS concerns. Throws on non-2xx or malformed JSON.
 */
export async function fetchThemeConfig(realmName: string): Promise<ThemeConfig> {
    const url = `/realms/${encodeURIComponent(realmName)}/theme-config`;
    const res = await fetch(url, { credentials: "omit" });
    if (!res.ok) throw new Error(`theme-config ${res.status}`);
    return res.json();
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/themeConfig.ts
git commit -m "feat: add themeConfig type, cache, and fetch helpers

Pure logic (no React) for SPI-driven realm theme config: ThemeConfig
type, localStorage cache with 5-minute TTL keyed by realm, and a
fetch helper using a relative URL to the SPI endpoint."
```

---

## Task 4: useThemeConfig hook

**Files:**
- Create: `src/lib/useThemeConfig.ts`

- [ ] **Step 1: Create the hook**

`src/lib/useThemeConfig.ts`:

```ts
import { useEffect, useState } from "react";
import {
    fetchThemeConfig,
    readCache,
    writeCache,
    type ThemeConfig,
} from "./themeConfig";

/**
 * React hook that returns the realm's theme config. Initialises from the
 * localStorage cache synchronously on first render, then triggers a fetch and
 * updates state when the fresh data lands. On fetch failure the previous
 * cached value is kept (no flicker to defaults on a transient outage).
 *
 * Intended to be called from each theme's PageWrapper exactly once; the result
 * is then exposed to descendants via ThemeConfigContext.
 */
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
                // SPI not deployed, network outage, etc. — keep previous state
            });
        return () => {
            cancelled = true;
        };
    }, [realmName]);

    return config;
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/useThemeConfig.ts
git commit -m "feat: add useThemeConfig hook

React hook initialising from localStorage cache, then refreshing
from the SPI in the background. Cancellation on unmount; previous
value preserved on fetch failure."
```

---

## Task 5: ThemeConfigContext + PageWrapper integration

**Files:**
- Create: `src/lib/themeConfigContext.tsx`
- Modify: `src/login/components/PageWrapper.tsx`
- Modify: `src/account/components/PageWrapper.tsx`

- [ ] **Step 1: Create the context module**

`src/lib/themeConfigContext.tsx`:

```tsx
import { createContext, useContext, type ReactNode } from "react";
import type { ThemeConfig } from "./themeConfig";

const ThemeConfigContext = createContext<ThemeConfig>({});

export function ThemeConfigProvider({
    value,
    children,
}: {
    value: ThemeConfig;
    children: ReactNode;
}) {
    return (
        <ThemeConfigContext.Provider value={value}>
            {children}
        </ThemeConfigContext.Provider>
    );
}

/**
 * Consumes the ThemeConfig provided by the nearest PageWrapper. Returns an
 * empty object when no provider is present (e.g., in isolated unit tests).
 */
export function useThemeConfigContext(): ThemeConfig {
    return useContext(ThemeConfigContext);
}
```

- [ ] **Step 2: Wire into the login PageWrapper**

Modify `src/login/components/PageWrapper.tsx`:

Add imports at the top (preserve existing imports):

```tsx
import { useThemeConfig } from "@/lib/useThemeConfig";
import { ThemeConfigProvider } from "@/lib/themeConfigContext";
```

Inside the `PageWrapper` function body, BEFORE the existing `useEffect`, add:

```tsx
const themeConfig = useThemeConfig(kcContext.realm.name);
```

Then wrap the existing return JSX with `<ThemeConfigProvider value={themeConfig}>`. Final structure:

```tsx
return (
    <ThemeConfigProvider value={themeConfig}>
        <>
            <div className="pb-20">{children}</div>
            <PageHeader kcContext={kcContext} />
        </>
    </ThemeConfigProvider>
);
```

- [ ] **Step 3: Wire into the account PageWrapper**

Modify `src/account/components/PageWrapper.tsx` the same way:

Add imports:

```tsx
import { useThemeConfig } from "@/lib/useThemeConfig";
import { ThemeConfigProvider } from "@/lib/themeConfigContext";
```

Inside the function body, before the existing `useEffect`:

```tsx
const themeConfig = useThemeConfig(kcContext.realm?.name ?? "");
```

(The `?? ""` guard handles the account theme's TypeScript narrowing where `realm` may be typed as optional.)

Wrap the existing return with the provider:

```tsx
return (
    <ThemeConfigProvider value={themeConfig}>
        <AccountLayout kcContext={kcContext}>
            {children}
            <PageHeader kcContext={kcContext} />
        </AccountLayout>
    </ThemeConfigProvider>
);
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: zero TypeScript errors. Vite build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/lib/themeConfigContext.tsx src/login/components/PageWrapper.tsx src/account/components/PageWrapper.tsx
git commit -m "feat: provide ThemeConfig via context from PageWrappers

Both PageWrappers now call useThemeConfig(realm.name) once and expose
the result via ThemeConfigProvider. Descendant components consume
via useThemeConfigContext, avoiding double-fetch and prop-drilling."
```

---

## Task 6: Logo + useFavicon consume themeConfig

**Files:**
- Modify: `src/components/Logo.tsx`
- Modify: `src/lib/useFavicon.ts`

- [ ] **Step 1: Modify `src/components/Logo.tsx`**

Replace the entire file contents with:

```tsx
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { parseRealmLogoConfig } from "@/lib/realmLogoConfig";
import { useThemeConfigContext } from "@/lib/themeConfigContext";

interface LogoProps {
    /** kcContext, used for the displayNameHtml fallback. */
    kcContext: { realm?: { displayNameHtml?: string } };
    /** Theme-relative default path, e.g. "img/keycloak-logo-text.png". */
    defaultLight: string;
    /** Optional separate dark-mode default; falls back to defaultLight if absent. */
    defaultDark?: string;
    /** Resolves a theme-relative path to an absolute URL Keycloak can serve. */
    getResourcePath: (path: string) => string;
    className?: string;
    alt: string;
}

/**
 * Renders the realm's configured logo with light/dark variants. Priority order:
 *   1. ThemeConfig (SPI) — `logoLight` / `logoDark`
 *   2. parseRealmLogoConfig(displayNameHtml) — legacy fallback
 *   3. bundled default via getResourcePath
 *
 * Both <img> elements are rendered; Tailwind's class-based dark mode selects
 * which is visible. If a custom URL fails to load, onError swaps to the
 * bundled default.
 */
export function Logo({
    kcContext,
    defaultLight,
    defaultDark,
    getResourcePath,
    className,
    alt,
}: LogoProps) {
    const themeConfig = useThemeConfigContext();
    const legacy = parseRealmLogoConfig(kcContext.realm?.displayNameHtml);

    const fallbackLight = getResourcePath(defaultLight);
    const fallbackDark = getResourcePath(defaultDark ?? defaultLight);

    const lightSrc = themeConfig.logoLight ?? legacy.light ?? fallbackLight;
    // dark fallback chain: SPI dark → SPI light → legacy dark → legacy light → bundled
    const darkSrc =
        themeConfig.logoDark ??
        themeConfig.logoLight ??
        legacy.dark ??
        legacy.light ??
        fallbackDark;

    const [lightFailed, setLightFailed] = useState(false);
    const [darkFailed, setDarkFailed] = useState(false);

    useEffect(() => {
        setLightFailed(false);
    }, [lightSrc]);

    useEffect(() => {
        setDarkFailed(false);
    }, [darkSrc]);

    return (
        <>
            <img
                src={lightFailed ? fallbackLight : lightSrc}
                alt={alt}
                className={cn(className, "block dark:hidden")}
                onError={() => {
                    if (!lightFailed) setLightFailed(true);
                }}
            />
            <img
                src={darkFailed ? fallbackDark : darkSrc}
                alt={alt}
                className={cn(className, "hidden dark:block")}
                onError={() => {
                    if (!darkFailed) setDarkFailed(true);
                }}
            />
        </>
    );
}
```

- [ ] **Step 2: Modify `src/lib/useFavicon.ts`**

Replace the entire file contents with:

```ts
import { useEffect } from "react";
import { parseRealmLogoConfig } from "./realmLogoConfig";
import { useThemeConfigContext } from "./themeConfigContext";

/**
 * Updates <link rel="icon"> in document.head with the realm-configured favicon.
 * Priority order:
 *   1. ThemeConfig (SPI) — `faviconUrl`
 *   2. parseRealmLogoConfig(displayNameHtml).favicon — legacy
 *   3. no-op (bundled favicon preserved)
 *
 * Restores the previous state on unmount or when the resolved favicon changes —
 * for Storybook hygiene; production has full reloads between Keycloak pages.
 */
export function useFavicon(kcContext: { realm?: { displayNameHtml?: string } }) {
    const themeConfig = useThemeConfigContext();
    const legacy = parseRealmLogoConfig(kcContext.realm?.displayNameHtml);
    const favicon = themeConfig.faviconUrl ?? legacy.favicon;

    useEffect(() => {
        if (!favicon) {
            return;
        }

        const existing = Array.from(
            document.head.querySelectorAll<HTMLLinkElement>(
                'link[rel="icon"], link[rel="shortcut icon"]'
            )
        );

        if (existing.length === 0) {
            const link = document.createElement("link");
            link.rel = "icon";
            link.href = favicon;
            document.head.appendChild(link);
            return () => {
                link.remove();
            };
        }

        const originalHrefs = existing.map(l => l.href);
        existing.forEach(link => {
            link.href = favicon;
        });
        return () => {
            existing.forEach((link, i) => {
                link.href = originalHrefs[i];
            });
        };
    }, [favicon]);
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: zero TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Logo.tsx src/lib/useFavicon.ts
git commit -m "feat: Logo + useFavicon consume themeConfig from context

Priority chain: SPI themeConfig → displayNameHtml legacy → bundled
default. SPI takes precedence; displayNameHtml mechanism kept as
fallback so existing realm configs continue to work."
```

---

## Task 7: Storybook variants

**Files:**
- Modify: `src/login/pages/Login.stories.tsx`
- Modify: `src/login/pages/Register.stories.tsx`
- Modify: `src/account/pages/Account.stories.tsx`

- [ ] **Step 1: Append SPI stories to `Login.stories.tsx`**

Append at the end of the file (after the last existing export):

```tsx
// SPI-driven logo / favicon: seed localStorage cache before render. fetch will
// fail in Storybook (no Keycloak) but the seeded cache renders correctly.
function seedThemeCache(realm: string, data: Record<string, string>) {
    localStorage.setItem(
        "kc-theme-config",
        JSON.stringify({ realm, data, ts: Date.now() })
    );
}

export const WithSPILogo: Story = {
    render: () => {
        seedThemeCache("master", {
            logoLight: "https://placehold.co/200x80/0066cc/white?text=SPI+Light",
            logoDark: "https://placehold.co/200x80/00ccff/black?text=SPI+Dark",
        });
        return (
            <KcPageStory
                kcContext={{
                    realm: { name: "master" },
                }}
            />
        );
    },
};

export const WithSPIFavicon: Story = {
    render: () => {
        seedThemeCache("master", {
            faviconUrl: "https://placehold.co/32x32/ff00ff/white.png",
        });
        return (
            <KcPageStory
                kcContext={{
                    realm: { name: "master" },
                }}
            />
        );
    },
};
```

- [ ] **Step 2: Append the same `seedThemeCache` helper + `WithSPILogo` to `Register.stories.tsx`**

```tsx
function seedThemeCache(realm: string, data: Record<string, string>) {
    localStorage.setItem(
        "kc-theme-config",
        JSON.stringify({ realm, data, ts: Date.now() })
    );
}

export const WithSPILogo: Story = {
    render: () => {
        seedThemeCache("master", {
            logoLight: "https://placehold.co/200x80/0066cc/white?text=SPI+Light",
            logoDark: "https://placehold.co/200x80/00ccff/black?text=SPI+Dark",
        });
        return (
            <KcPageStory
                kcContext={{
                    realm: { name: "master" },
                }}
            />
        );
    },
};
```

- [ ] **Step 3: Append SPI stories to `Account.stories.tsx`**

The account theme stories cast `kcContext` with `as any` because the account `KcContext` type doesn't perfectly align with the partial mock shape. Mirror the existing pattern:

```tsx
function seedThemeCache(realm: string, data: Record<string, string>) {
    localStorage.setItem(
        "kc-theme-config",
        JSON.stringify({ realm, data, ts: Date.now() })
    );
}

export const WithSPILogo: Story = {
    render: () => {
        seedThemeCache("master", {
            logoLight: "https://placehold.co/200x80/0066cc/white?text=SPI+Light",
            logoDark: "https://placehold.co/200x80/00ccff/black?text=SPI+Dark",
        });
        return (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <KcPageStory kcContext={{ realm: { name: "master" } } as any} />
        );
    },
};

export const WithSPIFavicon: Story = {
    render: () => {
        seedThemeCache("master", {
            faviconUrl: "https://placehold.co/32x32/ff00ff/white.png",
        });
        return (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <KcPageStory kcContext={{ realm: { name: "master" } } as any} />
        );
    },
};
```

- [ ] **Step 4: Visual verification in Storybook**

```bash
npm run storybook
```

Open http://localhost:6006 and click through:
- `login/login.ftl → WithSPILogo` — light mode shows blue "SPI Light"; toggle to dark mode → cyan "SPI Dark".
- `login/login.ftl → WithSPIFavicon` — DevTools > Application > Tab/iframe `<link rel="icon">` href is the magenta placeholder.
- `login/register.ftl → WithSPILogo` — same blue/cyan pair.
- `account/account.ftl → WithSPILogo` — same in account theme.
- `account/account.ftl → WithSPIFavicon` — favicon swap visible in DevTools.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/login/pages/Login.stories.tsx src/login/pages/Register.stories.tsx src/account/pages/Account.stories.tsx
git commit -m "test: add SPI story variants seeding localStorage cache

Each new story writes a fresh CacheEntry into localStorage before
render, simulating a successful prior SPI fetch. Verifies the Logo
priority chain reads the SPI source first."
```

---

## Task 8: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the Dynamic Logo section**

Find the section starting with `### Dynamic Logo & Favicon Configuration`. Replace its body (down to just before `### Customization Strategies`) with:

```markdown
### Dynamic Logo & Favicon Configuration

The theme reads per-realm branding from two sources, in priority order:

1. **Theme Config SPI** (primary, recommended) — the bundled Java SPI exposes a public REST endpoint `/realms/{realm}/theme-config` that serves all `theme.*` attributes of the realm. The theme fetches this on page load and caches the result in `localStorage` for 5 minutes.
2. **`displayNameHtml`** (legacy fallback) — for realms set up before the SPI existed, the theme still parses HTML comments out of `Realm Settings → General → Display name HTML` (e.g. `<!--logo-light:URL-->`) and accepts a bare URL as the logo.

#### Recommended workflow (SPI)

1. Build and deploy: `npm run build-keycloak-theme` produces both `dist_keycloak/keycloak-shadcn-*.jar` (theme) and `dist_keycloak/theme-config-spi.jar` (SPI). Copy both into your Keycloak's `providers/` directory and restart.
2. Set realm attributes via the Keycloak admin REST API:

   ```bash
   TOKEN=$(curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
     -d "client_id=admin-cli" -d "username=admin" -d "password=admin" \
     -d "grant_type=password" | jq -r .access_token)

   curl -X PATCH http://localhost:8080/admin/realms/<your-realm> \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "attributes": {
         "theme.logoLight": "https://cdn.example.com/logo.png",
         "theme.logoDark":  "https://cdn.example.com/logo-dark.png",
         "theme.faviconUrl": "https://cdn.example.com/favicon.ico"
       }
     }'
   ```
3. Verify: `curl http://localhost:8080/realms/<your-realm>/theme-config` should return the JSON without the `theme.` prefix.

#### Supported keys

| Attribute | Purpose |
|---|---|
| `theme.logoLight` | Logo shown in light mode |
| `theme.logoDark` | Logo shown in dark mode (falls back to `logoLight` if absent) |
| `theme.faviconUrl` | Browser tab icon |

Any other `theme.*` attribute is also exposed on the endpoint (without the prefix) for future use.

#### Legacy: Display name HTML

You can still configure the logo via `Realm Settings → General → Display name HTML`. Either paste a bare URL (taken as `logo-light`) or use the HTML comment form:

```html
<!--logo-light:https://cdn.example.com/logo.png-->
<!--logo-dark:https://cdn.example.com/logo-dark.png-->
<!--favicon:https://cdn.example.com/favicon.ico-->
```

This mechanism is preserved for backward compatibility. New deployments should use the SPI.

#### Fallback behaviour

If neither source provides a value, or a URL fails to load, the bundled defaults (`img/keycloak-logo-text.png`, `public/favicon-32x32.png`) are used. Pages never block on a missing logo.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document Theme Config SPI as primary dynamic-logo mechanism

displayNameHtml is now documented as the legacy fallback. SPI section
covers build, deploy, admin REST setup, and supported keys."
```

---

## Task 9: Real-Keycloak smoke test

**Files:** none (verification only — no commits).

This task confirms the end-to-end flow against a real Keycloak instance. Required before merging.

- [ ] **Step 1: Full build**

```bash
cd D:/projects/emirman.dev/keycloakify-starter
npm run build-keycloak-theme
```

Expected: `dist_keycloak/` contains `keycloak-shadcn-*.jar` AND `theme-config-spi.jar`.

- [ ] **Step 2: Start a local Keycloak**

```bash
docker run --rm -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v "$(pwd)/dist_keycloak:/opt/keycloak/providers" \
  quay.io/keycloak/keycloak:26.0 start-dev
```

(On Windows PowerShell, replace `$(pwd)` with `${PWD}`.)

Wait for the line `Listening on: http://0.0.0.0:8080`.

- [ ] **Step 3: Configure the theme on a realm**

In the Admin Console (http://localhost:8080):
1. Log in with `admin` / `admin`.
2. Use the `master` realm (or create a new test realm).
3. **Realm Settings → Themes**: set Login Theme and Account Theme to `keycloak-shadcn`. Save.

- [ ] **Step 4: Set theme attributes via admin REST**

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
  -d "client_id=admin-cli" -d "username=admin" -d "password=admin" \
  -d "grant_type=password" | jq -r .access_token)

curl -X PATCH http://localhost:8080/admin/realms/master \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "theme.logoLight": "https://placehold.co/200x80/0066cc/white?text=Light",
      "theme.logoDark":  "https://placehold.co/200x80/00ccff/black?text=Dark",
      "theme.faviconUrl": "https://placehold.co/32x32/ff00ff/white.png"
    }
  }'
```

Expected: HTTP 204 (No Content) or similar success.

- [ ] **Step 5: Verify the SPI endpoint directly**

```bash
curl http://localhost:8080/realms/master/theme-config
```

Expected: JSON like
```json
{"logoLight":"https://placehold.co/200x80/0066cc/white?text=Light","logoDark":"https://placehold.co/200x80/00ccff/black?text=Dark","faviconUrl":"https://placehold.co/32x32/ff00ff/white.png"}
```

If you get 404, the SPI JAR wasn't picked up — check that `theme-config-spi.jar` is in Keycloak's `providers/` and that Keycloak was restarted after copying.

- [ ] **Step 6: Verify the login page**

Open a private/incognito browser window (clean localStorage) and navigate to:
`http://localhost:8080/realms/master/account/`

You will be redirected to the login page. Observe:
- **First load**: brief default-logo flash, then the blue "Light" placeholder appears.
- DevTools → Network: a `GET /realms/master/theme-config` request returns 200.
- DevTools → Application → LocalStorage: `kc-theme-config` entry is present.
- Toggle dark mode (theme switcher in the footer bar): logo changes to cyan "Dark" placeholder.
- Browser tab favicon: magenta placeholder.

- [ ] **Step 7: Verify the second load (cache hit)**

Reload the page. The custom logo should appear **immediately** (no default-logo flash) because localStorage cache is served synchronously on first render.

- [ ] **Step 8: Verify account console**

After login: account console at `/realms/master/account/`. Logo appears at the top, dark-mode-reactive. Favicon matches.

- [ ] **Step 9: Verify fallback when SPI is removed**

Stop Keycloak, remove `theme-config-spi.jar` from `dist_keycloak/`, restart Keycloak (or just stop the container, delete the file, `docker run` again with the same volume mount).

Clear localStorage in the browser (DevTools → Application → Clear). Reload the login page.

Expected: the bundled default logo renders (no SPI to fetch from, displayNameHtml not set, so falls back to default). Console is clean — no `console.error`.

- [ ] **Step 10: Verify legacy displayNameHtml fallback**

Bring the SPI JAR back, restart Keycloak, but also remove the `theme.logoLight` attribute and set `displayNameHtml`:

```bash
curl -X PATCH http://localhost:8080/admin/realms/master \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": { "theme.logoLight": null },
    "displayNameHtml": "https://placehold.co/200x80/00aa00/white?text=Legacy"
  }'
```

(Setting an attribute to `null` removes it in Keycloak's admin REST.)

Clear localStorage, reload. Expected: green "Legacy" placeholder appears — proves the displayNameHtml fallback still works when SPI returns empty.

- [ ] **Step 11: Report results**

If all steps pass: the branch is ready to merge.

If any step fails: file the symptom, do not patch from this plan. Implementation has a bug that needs diagnosing.

---

## Self-review notes

- **Spec coverage:** every spec section maps to a task — SPI (Task 1), build pipeline (Task 2), theme types/cache (Task 3), hook (Task 4), context + PageWrapper (Task 5), Logo + useFavicon (Task 6), stories (Task 7), README (Task 8), smoke test (Task 9).
- **Placeholders:** none. All code blocks complete; no TBDs or "similar to" cross-references.
- **Type consistency:**
    - `ThemeConfig = Record<string, string>` — used identically in `themeConfig.ts` (Task 3), `useThemeConfig.ts` (Task 4), `themeConfigContext.tsx` (Task 5), and consumed by Logo/useFavicon (Task 6).
    - `readCache(realm)` / `writeCache(realm, data)` / `fetchThemeConfig(realmName)` signatures consistent across all consumers.
    - `useThemeConfig(realmName)` returns `ThemeConfig` — matches Provider's `value` prop.
    - `useThemeConfigContext()` returns `ThemeConfig` — matches Logo/useFavicon consumption.
- **Cross-task consistency:** the CACHE_KEY constant (`"kc-theme-config"`) is defined in `themeConfig.ts` and replicated literally in Storybook seed functions (Task 7). If `CACHE_KEY` changes, the stories must be updated — flag as a known coupling. Acceptable because seeded cache is test fixture code, not production logic.
