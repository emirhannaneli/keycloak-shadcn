# Theme Config Admin UI Implementation Plan (Phase 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Theme Config" tab under Realm Settings in the Keycloak admin console that edits `theme.logoLight` / `theme.logoDark` / `theme.faviconUrl` realm attributes, leveraging Keycloak's experimental Declarative UI SPI.

**Architecture:** A new Java class `ThemeConfigUiTabProviderFactory` implements both `UiTabProvider` and `UiTabProviderFactory<ComponentModel>`. Keycloak auto-renders three text inputs from `getConfigProperties()`. ComponentModel is the form's authoritative storage (so the form pre-populates on re-open). On every `onCreate` / `onUpdate`, values are mirrored to `realm.attributes["theme.*"]` so the Phase 1 SPI endpoint serves them unchanged. URL-shape validation runs in `validateConfiguration` before write.

**Tech Stack:** Java 17 (Keycloak 26 baseline) · Keycloak Declarative UI SPI (experimental, requires `--features=declarative-ui`) · existing Maven Wrapper + build pipeline from Phase 1 · no theme-side code changes · no new dependencies.

**Spec:** `docs/superpowers/specs/2026-05-26-spi-admin-ui-design.md`

---

## Pre-flight (run once before Task 1)

- Verify Phase 1 is on `main` and `npm run build-keycloak-theme` still passes end-to-end (Maven Wrapper picks up Java 17, JAR built, theme JARs built):

  ```bash
  cd D:/projects/emirman.dev/keycloakify-starter
  git checkout main
  git pull   # if collaborating; OK to skip if local-only
  npm run build-keycloak-theme
  ls dist_keycloak/theme-config-spi.jar dist_keycloak/keycloak-shadcn-26.0-to-26.1.jar
  ```

  Both files should exist. If not, fix Phase 1 first.

- Create a feature branch from `main`:

  ```bash
  git checkout -b feat/theme-config-admin-ui
  ```

---

## File Structure

**Create:**
- `spi/src/main/java/dev/emirman/keycloak/themeconfig/admin/ThemeConfigUiTabProviderFactory.java`
- `spi/src/main/resources/META-INF/services/org.keycloak.services.ui.extend.UiTabProviderFactory`

**Modify:**
- `README.md` — add the admin UI section, the `--features=declarative-ui` prerequisite, the Keycloak 26.2.x known-issue note, and the "pick one workflow" caveat.

**Unchanged:**
- All theme-side code (`src/lib/themeConfig.ts`, `src/lib/useThemeConfig.ts`, `src/lib/themeConfigContext.tsx`, `src/lib/useFavicon.ts`, `src/components/Logo.tsx`, both `PageWrapper.tsx`).
- Phase 1 SPI Java classes (`ThemeConfigResourceProvider.java`, `ThemeConfigResourceProviderFactory.java`).
- Phase 1 service file (`META-INF/services/org.keycloak.services.resource.RealmResourceProviderFactory`).
- `spi/pom.xml` — new file uses dependencies already declared.
- `scripts/build-spi.mjs`, `scripts/build-keycloak-theme.mjs`, `package.json`, Maven Wrapper.
- All Storybook story files.

---

## Task 1: Java provider factory class

**Files:**
- Create: `spi/src/main/java/dev/emirman/keycloak/themeconfig/admin/ThemeConfigUiTabProviderFactory.java`

The package is `dev.emirman.keycloak.themeconfig.admin` — note the new `.admin` sub-package matching the directory layout.

- [ ] **Step 1: Create the file**

Create directory if needed: `spi/src/main/java/dev/emirman/keycloak/themeconfig/admin/`

Write `ThemeConfigUiTabProviderFactory.java` with exactly this content:

```java
package dev.emirman.keycloak.themeconfig.admin;

import org.keycloak.Config;
import org.keycloak.component.ComponentModel;
import org.keycloak.component.ComponentValidationException;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.models.RealmModel;
import org.keycloak.provider.ProviderConfigProperty;
import org.keycloak.services.ui.extend.UiTabProvider;
import org.keycloak.services.ui.extend.UiTabProviderFactory;

import java.util.List;

/**
 * Adds a "Theme Config" tab under Realm Settings in the Keycloak admin console.
 * Form values are stored in a per-realm ComponentModel (so the form pre-populates
 * on re-open) and mirrored to realm.attributes["theme.*"] so the Phase 1
 * ThemeConfigResourceProvider continues to serve them to the theme.
 *
 * <p>Requires the experimental feature flag: <code>--features=declarative-ui</code>
 * (Keycloak 26.0, 26.1, 26.3+; the tab is hidden on 26.2.x due to upstream
 * regression keycloak#39971).</p>
 */
public class ThemeConfigUiTabProviderFactory
        implements UiTabProvider, UiTabProviderFactory<ComponentModel> {

    public static final String ID = "theme-config";
    private static final String ATTR_PREFIX = "theme.";

    private static final String KEY_LOGO_LIGHT = "logoLight";
    private static final String KEY_LOGO_DARK = "logoDark";
    private static final String KEY_FAVICON = "faviconUrl";

    @Override
    public String getId() {
        return ID;
    }

    @Override
    public String getHelpText() {
        return "Custom logo and favicon URLs served by the Theme Config SPI to login and account pages.";
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        return List.of(
                new ProviderConfigProperty(
                        KEY_LOGO_LIGHT,
                        "Light logo URL",
                        "URL of the logo shown in light mode. Leave blank to fall back to the bundled default.",
                        ProviderConfigProperty.STRING_TYPE,
                        null
                ),
                new ProviderConfigProperty(
                        KEY_LOGO_DARK,
                        "Dark logo URL",
                        "URL of the logo shown in dark mode. Falls back to the light logo if blank.",
                        ProviderConfigProperty.STRING_TYPE,
                        null
                ),
                new ProviderConfigProperty(
                        KEY_FAVICON,
                        "Favicon URL",
                        "URL of the browser tab icon. Leave blank to keep the bundled favicon.",
                        ProviderConfigProperty.STRING_TYPE,
                        null
                )
        );
    }

    @Override
    public void validateConfiguration(KeycloakSession session, RealmModel realm, ComponentModel component)
            throws ComponentValidationException {
        validateUrl(component, KEY_LOGO_LIGHT);
        validateUrl(component, KEY_LOGO_DARK);
        validateUrl(component, KEY_FAVICON);
    }

    private void validateUrl(ComponentModel component, String key) throws ComponentValidationException {
        String raw = component.getConfig().getFirst(key);
        if (raw == null || raw.isBlank()) {
            return; // blank clears the attribute — valid
        }
        String value = raw.trim();
        boolean shaped =
                value.startsWith("http://") ||
                value.startsWith("https://") ||
                value.startsWith("data:") ||
                value.startsWith("/");
        if (!shaped) {
            throw new ComponentValidationException(
                    "'" + key + "' must be a URL (http(s)://...), a data: URI, or an absolute path starting with /."
            );
        }
    }

    @Override
    public void onCreate(KeycloakSession session, RealmModel realm, ComponentModel component) {
        syncToRealmAttributes(realm, component);
    }

    @Override
    public void onUpdate(KeycloakSession session, RealmModel realm, ComponentModel component) {
        syncToRealmAttributes(realm, component);
    }

    private void syncToRealmAttributes(RealmModel realm, ComponentModel component) {
        syncOne(realm, component, KEY_LOGO_LIGHT);
        syncOne(realm, component, KEY_LOGO_DARK);
        syncOne(realm, component, KEY_FAVICON);
    }

    private void syncOne(RealmModel realm, ComponentModel component, String key) {
        String raw = component.getConfig().getFirst(key);
        String attrKey = ATTR_PREFIX + key;
        if (raw == null || raw.isBlank()) {
            realm.removeAttribute(attrKey);
        } else {
            realm.setAttribute(attrKey, raw.trim());
        }
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

- [ ] **Step 2: Build the SPI**

```bash
cd D:/projects/emirman.dev/keycloakify-starter
./mvnw -B -f spi/pom.xml clean package
```

(On Windows PowerShell: `.\mvnw.cmd -B -f spi/pom.xml clean package`.)

Expected: BUILD SUCCESS. Artifact at `spi/target/theme-config-spi.jar` (size grows slightly from Phase 1's ~5.5 KB; should now include the new class).

If the build fails with "cannot find symbol: class UiTabProvider" or similar:
- Verify `<keycloak.version>26.0.0</keycloak.version>` in `spi/pom.xml` is still set. `UiTabProvider` lives in `keycloak-server-spi-private`, which is already declared `provided` from Phase 1.
- If the class genuinely doesn't exist in 26.0.0, bump `<keycloak.version>` to `26.0.4` or `26.0.8` (whatever's the latest 26.0.x patch on Maven Central). Re-run.

- [ ] **Step 3: Confirm the new class is in the JAR**

```bash
unzip -l spi/target/theme-config-spi.jar | grep -E "(ThemeConfigUiTab|ThemeConfigResource|services/)"
```

Expected: lists both `ThemeConfigResourceProvider`, `ThemeConfigResourceProviderFactory`, AND the new `admin/ThemeConfigUiTabProviderFactory.class`, plus one `META-INF/services/...RealmResourceProviderFactory` (Phase 1's). The new service file is added in Task 2.

- [ ] **Step 4: Commit**

```bash
git add spi/src/main/java/dev/emirman/keycloak/themeconfig/admin/ThemeConfigUiTabProviderFactory.java
git commit -m "feat(spi): add Declarative UI tab for theme config

Adds a 'Theme Config' tab under Realm Settings via Keycloak's
experimental Declarative UI SPI. Three text inputs (logoLight,
logoDark, faviconUrl) are stored in a ComponentModel and mirrored
to realm.attributes['theme.*'] so the Phase 1 ThemeConfigResource
endpoint continues to serve them unchanged."
```

---

## Task 2: Service file registration

**Files:**
- Create: `spi/src/main/resources/META-INF/services/org.keycloak.services.ui.extend.UiTabProviderFactory`

Without this registration, the factory class is on the classpath but Keycloak's `ServiceLoader` never instantiates it — the tab won't appear.

- [ ] **Step 1: Create the service file**

The file path uses dots in the filename (not slashes — it IS a single filename). Create:

`spi/src/main/resources/META-INF/services/org.keycloak.services.ui.extend.UiTabProviderFactory`

Content (single line + trailing newline, exact):

```
dev.emirman.keycloak.themeconfig.admin.ThemeConfigUiTabProviderFactory
```

Ensure the file ends with `\n` (one trailing newline). Same posture as the Phase 1 service file — Quarkus's build-time service-loader augmentation is stricter than OpenJDK's default ServiceLoader.

- [ ] **Step 2: Rebuild the SPI**

```bash
./mvnw -B -f spi/pom.xml clean package
```

Expected: BUILD SUCCESS.

- [ ] **Step 3: Verify both service files are in the JAR**

```bash
unzip -l spi/target/theme-config-spi.jar | grep META-INF/services
```

Expected output (order may vary):
```
   ... META-INF/services/org.keycloak.services.resource.RealmResourceProviderFactory
   ... META-INF/services/org.keycloak.services.ui.extend.UiTabProviderFactory
```

Both must be present, both non-empty.

Verify the new file's content:
```bash
unzip -p spi/target/theme-config-spi.jar META-INF/services/org.keycloak.services.ui.extend.UiTabProviderFactory
```

Expected (with a trailing newline):
```
dev.emirman.keycloak.themeconfig.admin.ThemeConfigUiTabProviderFactory
```

Verify file ends with `0x0A` (newline):
```bash
od -c spi/src/main/resources/META-INF/services/org.keycloak.services.ui.extend.UiTabProviderFactory | tail -1
```

Last visible characters should be `y  \n`.

- [ ] **Step 4: Commit**

```bash
git add spi/src/main/resources/META-INF/services/org.keycloak.services.ui.extend.UiTabProviderFactory
git commit -m "feat(spi): register ThemeConfigUiTabProviderFactory with ServiceLoader

Adds the META-INF/services entry for Keycloak's Declarative UI SPI
type, alongside the existing RealmResourceProviderFactory service
file from Phase 1. Both providers ship in the same JAR."
```

---

## Task 3: README updates

**Files:**
- Modify: `README.md` — the section starting `### Dynamic Logo & Favicon Configuration`.

- [ ] **Step 1: Locate the section**

Open `README.md` and find the line `### Dynamic Logo & Favicon Configuration`. The section currently ends right before `### Customization Strategies`.

- [ ] **Step 2: Replace the section's body**

Replace everything between `### Dynamic Logo & Favicon Configuration` (inclusive) and the next `###` heading (exclusive) with this new content:

```markdown
### Dynamic Logo & Favicon Configuration

The theme reads per-realm branding from realm attributes (`theme.logoLight`, `theme.logoDark`, `theme.faviconUrl`). You can edit these in two ways:

#### Option A — Admin Console UI (Phase 2)

A "Theme Config" tab appears under **Realm Settings** in the Keycloak admin console. Three text inputs: light logo URL, dark logo URL, favicon URL. Validation is light (URL-shape check); blank fields clear the attribute and fall back to the bundled default.

**Prerequisites:**

1. Keycloak must start with the experimental feature flag enabled:

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

2. Deploy the SPI JAR (`dist_keycloak/theme-config-spi.jar`) into Keycloak's `providers/` directory alongside the theme JAR matching your Keycloak version. Restart Keycloak.

3. Open Admin Console → Realm Settings → "Theme Config" tab. Fill in URLs, save.

**Caveats:**

- The `declarative-ui` feature is marked experimental by Keycloak. It may change without notice in future Keycloak versions.
- Keycloak **26.2.x has a regression** ([keycloak#39971](https://github.com/keycloak/keycloak/issues/39971)) that hides custom UI tabs. Use Option B or upgrade to 26.3.x+.
- The form stores values in a Keycloak `ComponentModel` and mirrors them to `realm.attributes`. If you edit attributes via REST first and then open the UI, the form shows empty until you save once — **pick one workflow, UI or REST, not both**.

#### Option B — Admin REST API

The Phase 1 workflow remains available. Set the realm attributes directly via Keycloak's admin REST API — no feature flag needed:

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

Verify: `curl http://localhost:8080/realms/<your-realm>/theme-config` returns the JSON without the `theme.` prefix.

#### Supported keys

| Attribute | Purpose |
|---|---|
| `theme.logoLight` | Logo shown in light mode |
| `theme.logoDark` | Logo shown in dark mode (falls back to `logoLight` if absent) |
| `theme.faviconUrl` | Browser tab icon |

Any other `theme.*` attribute is also exposed on the endpoint (without the prefix), but only these three are surfaced as inputs in Option A's UI.

#### Building the SPI

The `npm run build-keycloak-theme` script invokes the bundled Apache Maven Wrapper (`./mvnw` / `mvnw.cmd`), so no system Maven install is required. First invocation downloads Maven 3.9.16 into `~/.m2/wrapper/dists/` (~30 seconds). Subsequent builds reuse the cached Maven. Deploy **only the theme JAR matching your Keycloak version** (e.g. `keycloak-shadcn-26.0-to-26.1.jar` for Keycloak 26.0.x / 26.1.x), together with `theme-config-spi.jar`. Deploying multiple version JARs together causes Keycloak to pick an ambiguous parent-theme chain.

#### Legacy: Display name HTML

You can still configure the logo via `Realm Settings → General → Display name HTML`. Either paste a bare URL (taken as `logo-light`) or use the HTML comment form:

```html
<!--logo-light:https://cdn.example.com/logo.png-->
<!--logo-dark:https://cdn.example.com/logo-dark.png-->
<!--favicon:https://cdn.example.com/favicon.ico-->
```

This mechanism is preserved for backward compatibility. New deployments should use Option A or B above.

#### Fallback behaviour

If neither source provides a value, or a URL fails to load, the bundled defaults (`img/keycloak-logo-text.png`, `public/favicon-32x32.png`) are used. Pages never block on a missing logo.
```

- [ ] **Step 3: Verify**

Skim the README and confirm:
- The new section starts with `### Dynamic Logo & Favicon Configuration` at the same position as before.
- It is followed by `### Customization Strategies` with no orphan content between.
- `git grep "loginLogoUrl" README.md` returns nothing (legacy i18n mechanism mention was already gone from Phase 1).

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: document Theme Config admin UI option (Phase 2)

Adds a parallel 'Option A — Admin Console UI' section alongside
the existing curl-based 'Option B — Admin REST API' workflow.
Documents the --features=declarative-ui prerequisite, the
Keycloak 26.2.x regression, and the ComponentModel-vs-attribute
seeding caveat."
```

---

## Task 4: Real-Keycloak smoke test

**Files:** none (verification only — no commits).

This is the release gate. The Declarative UI SPI has no automated verification path; correctness can only be confirmed by deploying to a Keycloak instance and clicking through.

- [ ] **Step 1: Full build**

```bash
cd D:/projects/emirman.dev/keycloakify-starter
npm run build-keycloak-theme
ls -la dist_keycloak/theme-config-spi.jar
```

Confirm `theme-config-spi.jar` exists and is slightly larger than Phase 1 (it now contains the extra class).

- [ ] **Step 2: Restart Keycloak with the feature flag**

Stop the existing Keycloak container (if any), then restart with `--features=declarative-ui`:

```powershell
docker stop $(docker ps --filter "ancestor=quay.io/keycloak/keycloak" --format "{{.ID}}")

docker run --rm -p 8082:8080 `
  -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin `
  -v "${PWD}/dist_keycloak:/opt/keycloak/providers" `
  quay.io/keycloak/keycloak:26.0 `
  start-dev --features=declarative-ui
```

Wait for `Listening on: http://0.0.0.0:8080`.

In the providers/ mount, **only one keycloak-shadcn theme JAR should be present** (the one matching the Keycloak version — `keycloak-shadcn-26.0-to-26.1.jar` for 26.0.x). Multiple version JARs cause the account-theme parent-resolution issue we hit during Phase 1 smoke testing. Remove others before starting.

- [ ] **Step 3: Verify the provider is registered**

```powershell
$TOKEN = (Invoke-RestMethod -Method POST "http://localhost:8082/realms/master/protocol/openid-connect/token" `
    -Body @{client_id="admin-cli"; username="admin"; password="admin"; grant_type="password"}).access_token

(Invoke-RestMethod "http://localhost:8082/admin/serverinfo" -Headers @{Authorization="Bearer $TOKEN"}).providers.PSObject.Properties.Name | Where-Object { $_ -match "ui|tab|extend" }
```

Expected: at least one provider type name containing `ui` or `tab` (likely `ui-tab` or `ui-extend`). Drill in:

```powershell
$si = Invoke-RestMethod "http://localhost:8082/admin/serverinfo" -Headers @{Authorization="Bearer $TOKEN"}
# Try both candidate keys; whichever returns something is the right SPI type name:
$si.providers."ui-tab".providers
$si.providers."ui-extend".providers
```

Expected: one of those lists includes `theme-config`. If neither does, the provider failed to register — check Keycloak startup logs for class-loading errors:

```powershell
$cid = docker ps --filter "ancestor=quay.io/keycloak/keycloak" --format "{{.ID}}" | Select-Object -First 1
docker logs $cid 2>&1 | Select-String -Pattern "theme-config|UiTab|ThemeConfigUiTab|ClassNotFound|NoClassDefFound|SEVERE" -CaseSensitive:$false
```

- [ ] **Step 4: Open the admin console**

Browse to http://localhost:8082/admin/master/console/ and log in as `admin` / `admin`.

Navigate to: **Realm Settings** (left sidebar) → look for a tab in the tab bar at the top of the Realm Settings page named **Theme Config** (or `theme-config`).

If the tab is missing:
- Verify `--features=declarative-ui` is actually in effect: `docker exec $cid bin/kc.sh show-config | grep features`.
- Verify Keycloak version is NOT 26.2.x (`docker logs $cid 2>&1 | Select-String "Keycloak.*on JVM"`). On 26.2.x the regression hides custom tabs.

- [ ] **Step 5: Smoke-test the form — happy path**

Click the **Theme Config** tab. Expected: three empty text inputs labelled "Light logo URL", "Dark logo URL", "Favicon URL".

Fill in test URLs:
- Light logo URL: `https://placehold.co/200x80/0066cc/white?text=Light`
- Dark logo URL: `https://placehold.co/200x80/00ccff/black?text=Dark`
- Favicon URL: `https://placehold.co/32x32/ff00ff/white.png`

Click **Save**. Expected: success message, no errors.

- [ ] **Step 6: Verify the realm attributes were written**

```powershell
Invoke-RestMethod "http://localhost:8082/realms/master/theme-config"
```

Expected JSON (key order may vary):
```json
{
  "logoLight": "https://placehold.co/200x80/0066cc/white?text=Light",
  "logoDark":  "https://placehold.co/200x80/00ccff/black?text=Dark",
  "faviconUrl": "https://placehold.co/32x32/ff00ff/white.png"
}
```

Also via the admin REST API directly:

```powershell
(Invoke-RestMethod "http://localhost:8082/admin/realms/master" -Headers @{Authorization="Bearer $TOKEN"}).attributes |
  Get-Member -MemberType NoteProperty | Where-Object Name -like "theme.*"
```

Expected: three NoteProperty entries `theme.logoLight`, `theme.logoDark`, `theme.faviconUrl`.

- [ ] **Step 7: Verify the tab pre-populates on re-open**

Close the Theme Config tab (navigate away — e.g., click General), then return to **Realm Settings → Theme Config**.

Expected: the three inputs are populated with the values you just saved. **This is the key UX confirmation — proves ComponentModel storage round-trips correctly.**

- [ ] **Step 8: Verify the theme renders the new logo**

Open a private/incognito browser window (clean localStorage). Visit:

```
http://localhost:8082/realms/master/account
```

Expected: redirected to the login page, which shows the blue "Light" placeholder logo (or the cyan "Dark" placeholder in dark mode). The favicon in the browser tab is the magenta placeholder.

DevTools → Network: `GET /realms/master/theme-config` returns 200 with the JSON from Step 6.

- [ ] **Step 9: Smoke-test validation — failure path**

Go back to Admin Console → Realm Settings → Theme Config.

Replace the Light logo URL with: `not-a-url` (no scheme).

Click **Save**. Expected: inline validation error citing `'logoLight'` must be a URL. Save is blocked; no change to realm attributes.

Restore the original URL, save successfully.

- [ ] **Step 10: Smoke-test clearing — empty fields**

Clear all three fields (delete the text). Save.

Expected:
- Save succeeds.
- `Invoke-RestMethod "http://localhost:8082/realms/master/theme-config"` returns `{}` (empty object).
- Login page (in incognito, clear localStorage first) renders the bundled default logo.

- [ ] **Step 11: Verify graceful fallback when the feature flag is missing**

Stop the container, restart WITHOUT `--features=declarative-ui`:

```powershell
docker stop $cid
docker run --rm -p 8082:8080 `
  -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin `
  -v "${PWD}/dist_keycloak:/opt/keycloak/providers" `
  quay.io/keycloak/keycloak:26.0 `
  start-dev
```

Wait for startup. Expected:
- Admin Console → Realm Settings: **Theme Config tab is NOT present** (good — feature flag gates the SPI).
- `Invoke-RestMethod "http://localhost:8082/realms/master/theme-config"` still returns the JSON (good — Phase 1 SPI endpoint is independent of the feature flag).

This confirms Phase 1 and Phase 2 are properly decoupled.

- [ ] **Step 12: Report results**

If steps 1–11 all pass, the branch is ready to merge.

If any step fails, file what was observed vs expected. Do not patch from this plan — the failure likely indicates a real bug that needs diagnosis.

---

## Self-review notes

**Spec coverage:**
- Goal 1 (Theme Config tab) → Tasks 1 + 2.
- Goal 2 (three text inputs) → Task 1 `getConfigProperties()`.
- Goal 3 (URL validation) → Task 1 `validateConfiguration` + `validateUrl`.
- Goal 4 (pre-populate form) → ComponentModel storage is automatic when using Declarative UI SPI — confirmed in Task 4 Step 7.
- Goal 5 (mirror to realm.attributes) → Task 1 `syncToRealmAttributes`.
- Goal 6 (Phase 1 REST coexistence) → README Option B preserved (Task 3), Phase 1 SPI untouched.
- Goal 7 (same JAR) → no `pom.xml` change, no new dependencies.
- Non-goal "Multi-admin concurrency" → spec acknowledges; nothing to implement.
- Caveat "Keycloak 26.2 regression" → documented in README (Task 3) and verified-by-omission in Task 4.

**Placeholder scan:** no TBDs, no "TODO", no "similar to Task N" cross-references; every code block is complete.

**Type consistency:**
- The three field keys `KEY_LOGO_LIGHT` / `KEY_LOGO_DARK` / `KEY_FAVICON` use literal strings `"logoLight"` / `"logoDark"` / `"faviconUrl"` — same camelCase as the Phase 1 SPI's response JSON keys (which are realm-attribute names with the `theme.` prefix stripped). The form-key ↔ realm-attribute-key mapping is `attrKey = ATTR_PREFIX + key` = `"theme." + "logoLight"` = `"theme.logoLight"`. Consistent throughout.
- `ID = "theme-config"` matches the Phase 1 SPI's provider ID — Keycloak distinguishes them by SPI type (RealmResource vs UiTab), not by provider ID, so name collision is harmless. The README and serverinfo lookups in Task 4 reflect this (look under `ui-tab` / `ui-extend`, not `realm-restapi-extension`).
- Class lives in package `dev.emirman.keycloak.themeconfig.admin`. The service file in Task 2 references the full FQN.

**One known unknown:** the exact SPI type name in `/admin/serverinfo` output (`ui-tab` vs `ui-extend` vs something else). Task 4 Step 3 probes both candidates rather than committing to one — implementation discovers the correct name on first run. The plan does not depend on knowing this in advance.
