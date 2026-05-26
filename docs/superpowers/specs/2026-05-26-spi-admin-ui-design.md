# Theme Config Admin UI — Design (Phase 2)

**Date:** 2026-05-26
**Status:** Approved for implementation
**Scope:** Phase 2 of the Theme Config SPI project. Adds a Keycloak admin console UI for editing realm `theme.*` attributes, building on the Phase 1 SPI that is already merged on `main`. **Out of scope:** generic key-value editor (Phase 3 candidate), live logo preview, multi-admin concurrency handling.

## Problem

Phase 1 shipped a Keycloak SPI that exposes realm `theme.*` attributes to the theme via `/realms/{realm}/theme-config`. Admins set values today via the Keycloak Admin REST API (`curl PATCH /admin/realms/{realm}`). This works but is friction-heavy: the admin must memorise the attribute keys (`theme.logoLight`, `theme.logoDark`, `theme.faviconUrl`), construct a JSON payload, acquire a token, and run a curl command. There is no validation, no visual cue that the values are taking effect, and no discoverability — a new admin opening the Keycloak admin console has no way to know the feature exists.

A friendly admin UI inside Keycloak's admin console — same place where realm name, login flow, email server, and themes are configured — removes all of that friction.

## Goals

1. Add a "Theme Config" tab under **Realm Settings** in the Keycloak admin console.
2. Three text inputs: light logo URL, dark logo URL, favicon URL.
3. Light URL-shape validation: only `http(s)://...`, `data:...`, and `/...` accepted; obvious typos rejected before save.
4. Pre-populate the form with current values when the tab is opened.
5. Save writes to `realm.attributes["theme.*"]` so the Phase 1 SPI endpoint serves the new values without any theme-side change.
6. Coexist with the Phase 1 REST API workflow — admins who prefer curl keep working.
7. Ship in the same `theme-config-spi.jar` artifact — no new build step, no new dependency, no new prerequisite beyond the existing Maven Wrapper + JDK 17.

## Non-goals

- **Generic key-value editor** for arbitrary `theme.*` attributes (Phase 3 candidate if there's demand).
- **Live logo preview** rendering the configured URL in the admin UI — Keycloak's Declarative UI SPI does not support custom widgets; only auto-generated text/checkbox/select inputs.
- **File upload** for logos — admins host their own assets and paste URLs.
- **Multi-admin concurrent edit handling** — Keycloak's whole-realm PUT semantics mean last-save-wins. Acceptable for v1.
- **Migration from REST-API-set values** — admins who set `theme.*` via REST then open the UI for the first time will see an empty form (ComponentModel-based storage starts empty until first save). Documented limitation.
- **Compatibility with Keycloak 26.2.x** — a known upstream regression hides custom UI tabs in that minor. Documented; admins on 26.2 must skip Phase 2 (Phase 1 SPI still works) or upgrade to 26.3+.

## Approach

Keycloak 26 provides a **Declarative UI SPI** (interface `org.keycloak.services.ui.extend.UiTabProvider` + factory `UiTabProviderFactory`) that lets a Java provider declare a list of form fields and have Keycloak's admin console render them automatically as a tab under an existing admin page. The mechanism is gated behind a feature flag (`--features=declarative-ui`) and marked experimental, but is the only path to an integrated tab without forking the entire admin console.

The provider:
- Declares 3 `ProviderConfigProperty` entries (`logoLight`, `logoDark`, `faviconUrl`).
- Stores form values in a per-realm `ComponentModel` so the form pre-populates on re-open.
- On every save, mirrors the values to `realm.attributes["theme.*"]` so the Phase 1 SPI endpoint serves the data unchanged.
- Validates URL shape in `validateConfiguration` — Keycloak displays inline errors on save.

The Phase 1 SPI (`ThemeConfigResourceProvider`, REST GET endpoint) is untouched. The theme code (Logo, useFavicon, useThemeConfig, ThemeConfigContext, themeConfig.ts) is untouched.

## Architecture

Both providers ship in the same JAR (`spi/target/theme-config-spi.jar`). Two separate `META-INF/services/` registrations:

```
spi/src/main/
├── java/dev/emirman/keycloak/themeconfig/
│   ├── ThemeConfigResourceProvider.java               (Phase 1 — REST GET, unchanged)
│   ├── ThemeConfigResourceProviderFactory.java        (Phase 1, unchanged)
│   └── admin/
│       └── ThemeConfigUiTabProviderFactory.java       (Phase 2 — NEW)
└── resources/META-INF/services/
    ├── org.keycloak.services.resource.RealmResourceProviderFactory       (Phase 1)
    └── org.keycloak.services.ui.extend.UiTabProviderFactory              (Phase 2 — NEW)
```

### Data flow

```
Admin opens Realm Settings → Theme Config tab
    │
    ▼
Keycloak loads the realm's existing ComponentModel for this provider
    │
    ▼
Form auto-renders with previous values populated
    │
    ▼
Admin edits + clicks Save
    │
    ▼
Keycloak validates via ThemeConfigUiTabProviderFactory.validateConfiguration()
    │   (fail → inline error, no write)
    ▼
Keycloak persists the ComponentModel + calls onUpdate(session, realm, component)
    │
    ▼
onUpdate iterates the 3 keys: for each, either
   realm.setAttribute("theme." + key, value.trim())  if value is non-blank
   realm.removeAttribute("theme." + key)             if value is blank
    │
    ▼
Theme-side (next page load): existing Phase 1 SPI reads realm.attributes,
strips "theme." prefix, returns JSON → useThemeConfig fetches → Logo renders.
```

## Component — `ThemeConfigUiTabProviderFactory.java`

Implements both `UiTabProvider` and `UiTabProviderFactory<ComponentModel>`. Key methods:

- `getId()` → `"theme-config"` (also the tab label in the admin UI, humanised to "Theme Config").
- `getHelpText()` → short description shown by the admin console.
- `getConfigProperties()` → returns three `STRING_TYPE` properties: `logoLight`, `logoDark`, `faviconUrl`, each with label and help text.
- `validateConfiguration(session, realm, component)` → for each of the 3 keys, if a value is set, assert it starts with `http://`, `https://`, `data:`, or `/`. Otherwise throw `ComponentValidationException` with a clear message.
- `onCreate(session, realm, component)` and `onUpdate(session, realm, component)` → both call a shared `syncToRealmAttributes(realm, component)` which iterates the 3 keys: blank → `removeAttribute`, non-blank → `setAttribute` (trimmed).
- `init`, `postInit`, `close` → no-ops.

Constants live at the top of the class:

```java
public static final String ID = "theme-config";
private static final String ATTR_PREFIX = "theme.";
private static final String KEY_LOGO_LIGHT = "logoLight";
private static final String KEY_LOGO_DARK  = "logoDark";
private static final String KEY_FAVICON    = "faviconUrl";
```

## Service registration

`spi/src/main/resources/META-INF/services/org.keycloak.services.ui.extend.UiTabProviderFactory` — single line, trailing newline:

```
dev.emirman.keycloak.themeconfig.admin.ThemeConfigUiTabProviderFactory
```

## Build pipeline

Unchanged. `spi/pom.xml` Maven configuration picks up the new file automatically (compiles `src/main/java/**`). The existing dependency set (`keycloak-server-spi`, `keycloak-server-spi-private`, `keycloak-services`, `jakarta.ws.rs-api`) covers `UiTabProvider` — it lives in `keycloak-server-spi-private`. JAR filename and Maven coordinates are unchanged. `npm run build-keycloak-theme` continues to produce `dist_keycloak/theme-config-spi.jar` plus the per-Keycloak-version theme JARs.

## Keycloak version matrix

| Keycloak | Phase 1 SPI (REST GET) | Phase 2 UI tab |
|---|---|---|
| 26.0.x | works | works with `--features=declarative-ui` |
| 26.1.x | works | works with `--features=declarative-ui` |
| 26.2.x | works | **broken — upstream regression** ([keycloak#39971](https://github.com/keycloak/keycloak/issues/39971)) |
| 26.3.x+ | works | works with `--features=declarative-ui` |

On 26.2, admins fall back to the Phase 1 REST workflow. Documented in README.

## Deployment

One new operational requirement: Keycloak must start with the experimental feature flag enabled.

```bash
# Docker (dev mode):
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v "$(pwd)/dist_keycloak:/opt/keycloak/providers" \
  quay.io/keycloak/keycloak:26.0 \
  start-dev --features=declarative-ui

# Local install (production):
bin/kc.sh build --features=declarative-ui
bin/kc.sh start
```

Without the flag, the tab is invisible but the Phase 1 SPI endpoint remains available — the admin can still configure via curl. This is the intentional graceful degradation.

## Error handling

### Form-side (validation + sync)

| Scenario | Behaviour |
|---|---|
| Invalid URL (e.g., `"not-a-url"`) | `validateConfiguration` throws → inline error in admin UI → save blocked → no write to realm |
| Empty field | `removeAttribute` clears the attribute → theme falls back to bundled default |
| Whitespace around value | `trim()` removes it before write |
| Concurrent edit from a second admin | Last save wins (Keycloak whole-realm PUT semantics). Out of v1 scope. |

### Plugin loading

| Scenario | Behaviour |
|---|---|
| Admin starts Keycloak without `--features=declarative-ui` | Tab is invisible. Phase 1 SPI endpoint still serves data. curl workflow still works. |
| Admin runs Keycloak 26.2.x | Tab is invisible (upstream regression). Same fallback. |
| JAR missing from `providers/` | Neither tab nor REST endpoint exist. Theme falls back to displayNameHtml or bundled default. |
| Provider class load failure (e.g., Keycloak version mismatch) | Keycloak logs `SEVERE` at startup, continues running. Phase 1 + Phase 2 both missing in that case. |

### Mixing REST and UI workflows

ComponentModel is the authoritative storage for the form. If an admin sets `theme.logoLight` via the REST API and then opens the UI, the form shows empty (ComponentModel has no entry). Saving from this state wipes the REST-set attribute (ComponentModel writes empty → `removeAttribute`).

**Mitigation:** README explicitly documents "pick one workflow." For users who already configured via REST, the first UI save requires re-entering the URLs.

A v2 enhancement could initialise ComponentModel from existing `realm.attributes` the first time the UI is opened, eliminating this gap. Deferred — adds complexity for an edge case admins can avoid by sticking to one workflow.

### Logging

Java side: rely on Keycloak's default logging for exceptions. No custom log statements.

Theme side: no change — Phase 1 stays silent on success and silently falls back on failure.

## Testing

No automated tests. Mirrors Phase 1's posture (storybook + manual smoke test). Phase 2 has no theme-side surface to test in Storybook — all behaviour lives in Java + the Keycloak admin console rendering.

Verification is a manual real-Keycloak smoke test that the implementation plan will document step-by-step:

1. Build & deploy JAR with feature flag.
2. Confirm provider registration via `serverinfo` API (`ui-tab` or equivalent SPI type lists `theme-config`).
3. Open Realm Settings → confirm "Theme Config" tab exists.
4. Set values + save → confirm form persists on re-open + REST endpoint returns the new JSON.
5. Confirm theme renders with new logo (end-to-end check against the Phase 1 pipeline).
6. Set invalid URL → confirm inline validation error.
7. Clear fields + save → confirm `realm.attributes` cleared and theme falls back to bundled default.
8. Restart Keycloak without `--features=declarative-ui` → confirm tab disappears, Phase 1 REST endpoint still works.

## Documentation updates

`README.md` adds:

1. New subsection "Configure via Admin UI (alternative to REST)" under "Dynamic Logo & Favicon Configuration".
2. The `--features=declarative-ui` prerequisite in the deploy section.
3. The 26.2.x known-issue note with a one-line workaround pointer (use Phase 1 REST workflow or upgrade).
4. The "pick one workflow — UI or REST, not both" note explaining the ComponentModel ↔ realm.attributes seeding gap.

## Follow-ups (out of scope for Phase 2)

- **v2 ComponentModel seeding from realm.attributes** so mixed REST + UI workflows don't lose data on first UI save.
- **Phase 3 — generic key-value editor** if admins need to set additional `theme.*` keys beyond the three well-known ones.
- **Logo preview** widget once Keycloak's Declarative UI SPI supports custom field renderers (currently text-only).
- **Account theme parent-theme fix** for Keycloak 26 — a separate bug observed during Phase 1 smoke testing where the multi-page account theme references the now-defunct `keycloak` parent. Not blocking Phase 2 but worth its own spec.
