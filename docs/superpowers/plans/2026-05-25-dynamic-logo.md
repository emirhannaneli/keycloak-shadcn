# Dynamic Logo & Favicon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken `loginLogoUrl` i18n-based logo mechanism with per-realm light/dark logo + favicon, configured via HTML comments in the realm's "Display Name HTML" field, covering both login and account themes.

**Architecture:** A pure parser (`parseRealmLogoConfig`) extracts `<!--logo-light:...-->`, `<!--logo-dark:...-->`, `<!--favicon:...-->` comments from `kcContext.realm.displayNameHtml`. A shared `<Logo />` component renders two `<img>` tags with Tailwind `dark:hidden`/`dark:block` for theme-reactive variant selection. A `useFavicon` hook updates `<link rel="icon">` at mount. The existing `src/login/utils/logo.ts` is deleted.

**Tech Stack:** React 18 + TypeScript + Tailwind CSS (class-based dark mode) + Storybook for visual verification. No new dependencies. No new test runner — verification is via existing Storybook patterns and the dev-mode `getKcContextMock` block in `src/main.tsx`.

**Spec:** `docs/superpowers/specs/2026-05-25-dynamic-logo-design.md`

---

## File Structure

**Create:**
- `src/lib/realmLogoConfig.ts` — parser, pure function, no React.
- `src/lib/useFavicon.ts` — React hook, DOM manipulation only.
- `src/components/Logo.tsx` — shared component, accepts `kcContext` + defaults + `getResourcePath` prop.

**Modify:**
- `src/login/pages/LoginPage.tsx` — swap inline `<img>` + `getLoginLogoUrl` for `<Logo />`.
- `src/login/pages/RegisterPage.tsx` — same.
- `src/login/components/PageWrapper.tsx` — call `useFavicon(kcContext)`.
- `src/account/components/AccountLayout.tsx` — render `<Logo />` above main content.
- `src/account/components/PageWrapper.tsx` — call `useFavicon(kcContext)`.
- `src/login/pages/Login.stories.tsx` — new story variants exercising logo config.
- `src/login/pages/Register.stories.tsx` — same.
- `src/account/pages/Account.stories.tsx` — same for account theme.
- `README.md` — rewrite the "Dynamic Logo Configuration" section.

**Delete:**
- `src/login/utils/logo.ts` — replaced by `src/lib/realmLogoConfig.ts` + `<Logo />`.

---

## Task 1: Parser (`realmLogoConfig.ts`)

**Files:**
- Create: `src/lib/realmLogoConfig.ts`

- [ ] **Step 1: Create the parser file with type and stub**

Create `src/lib/realmLogoConfig.ts`:

```ts
export type RealmLogoConfig = {
    light?: string;
    dark?: string;
    favicon?: string;
};

const KNOWN_KEYS = ["logo-light", "logo-dark", "favicon"] as const;
type KnownKey = (typeof KNOWN_KEYS)[number];

const KEY_TO_FIELD: Record<KnownKey, keyof RealmLogoConfig> = {
    "logo-light": "light",
    "logo-dark": "dark",
    "favicon": "favicon",
};

/**
 * Parses logo / favicon URLs out of HTML comments embedded in a realm's
 * `displayNameHtml`. Comments look like:
 *
 *   <!--logo-light:https://cdn.example.com/logo.png-->
 *   <!--logo-dark:data:image/png;base64,...-->
 *   <!--favicon:/themes/x/favicon.ico-->
 *
 * Unknown keys are ignored. Duplicates: first wins. Empty values are absent.
 * URLs are not validated — broken URLs surface via `<img onError>` downstream.
 */
export function parseRealmLogoConfig(
    displayNameHtml: string | undefined | null
): RealmLogoConfig {
    if (!displayNameHtml) {
        return {};
    }

    const result: RealmLogoConfig = {};
    const regex = /<!--(logo-light|logo-dark|favicon):([^>]+?)-->/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(displayNameHtml)) !== null) {
        const key = match[1] as KnownKey;
        const value = match[2].trim();
        const field = KEY_TO_FIELD[key];
        if (value !== "" && result[field] === undefined) {
            result[field] = value;
        }
    }

    return result;
}
```

- [ ] **Step 2: Verify the file builds**

Run: `npx tsc --noEmit`
Expected: no errors. (If errors, fix and re-run.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/realmLogoConfig.ts
git commit -m "feat: add realmLogoConfig parser for logo/favicon URLs in displayNameHtml"
```

---

## Task 2: Logo component (`Logo.tsx`)

**Files:**
- Create: `src/components/Logo.tsx`

- [ ] **Step 1: Create the Logo component**

Create `src/components/Logo.tsx`:

```tsx
import { useState } from "react";
import { cn } from "@/lib/utils";
import { parseRealmLogoConfig } from "@/lib/realmLogoConfig";

interface LogoProps {
    /** kcContext, used for realm.displayNameHtml lookup. */
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
 * Renders the realm's configured logo with light/dark variants. Both <img>
 * elements are rendered; Tailwind's class-based dark mode selects which is
 * visible. If a custom URL fails to load, onError swaps to the bundled default.
 */
export function Logo({
    kcContext,
    defaultLight,
    defaultDark,
    getResourcePath,
    className,
    alt,
}: LogoProps) {
    const config = parseRealmLogoConfig(kcContext.realm?.displayNameHtml);

    const fallbackLight = getResourcePath(defaultLight);
    const fallbackDark = getResourcePath(defaultDark ?? defaultLight);

    const lightSrc = config.light ?? fallbackLight;
    const darkSrc = config.dark ?? config.light ?? fallbackDark;

    const [lightFailed, setLightFailed] = useState(false);
    const [darkFailed, setDarkFailed] = useState(false);

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

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Logo.tsx
git commit -m "feat: add Logo component with light/dark variants and error fallback"
```

---

## Task 3: Favicon hook (`useFavicon.ts`)

**Files:**
- Create: `src/lib/useFavicon.ts`

- [ ] **Step 1: Create the hook**

Create `src/lib/useFavicon.ts`:

```ts
import { useEffect } from "react";
import { parseRealmLogoConfig } from "./realmLogoConfig";

/**
 * Updates <link rel="icon"> in document.head with the favicon URL configured
 * in the realm's displayNameHtml. If no favicon is configured, the bundled
 * default favicon is left untouched. If multiple <link rel="icon"> tags exist
 * (different sizes), all are updated to the same URL.
 */
export function useFavicon(kcContext: { realm?: { displayNameHtml?: string } }) {
    useEffect(() => {
        const config = parseRealmLogoConfig(kcContext.realm?.displayNameHtml);
        if (!config.favicon) {
            return;
        }

        const existing = document.head.querySelectorAll<HTMLLinkElement>(
            'link[rel="icon"], link[rel="shortcut icon"]'
        );

        if (existing.length === 0) {
            const link = document.createElement("link");
            link.rel = "icon";
            link.href = config.favicon;
            document.head.appendChild(link);
            return;
        }

        existing.forEach(link => {
            link.href = config.favicon!;
        });
    }, [kcContext.realm?.displayNameHtml]);
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/useFavicon.ts
git commit -m "feat: add useFavicon hook to apply realm-configured favicon"
```

---

## Task 4: Wire the login theme

**Files:**
- Modify: `src/login/pages/LoginPage.tsx` (lines 6, 173-180)
- Modify: `src/login/pages/RegisterPage.tsx` (lines 5, 212-217)
- Modify: `src/login/components/PageWrapper.tsx`
- Delete: `src/login/utils/logo.ts`
- Modify: `src/login/pages/Login.stories.tsx`
- Modify: `src/login/pages/Register.stories.tsx`

- [ ] **Step 1: Replace logo block in `LoginPage.tsx`**

Remove the import:

```tsx
import { getLoginLogoUrl } from "../utils/logo";
```

Add the new import:

```tsx
import { Logo } from "@/components/Logo";
```

Replace the `<img>` block (currently lines 173-180):

```tsx
{/* System Logo */}
<div className="flex justify-center">
    <img 
        src={getLoginLogoUrl(i18n, "img/keycloak-logo-text.png", getResourcePath)} 
        alt="Keycloak" 
        className="h-20"
    />
</div>
```

with:

```tsx
{/* System Logo */}
<div className="flex justify-center">
    <Logo
        kcContext={kcContext}
        defaultLight="img/keycloak-logo-text.png"
        getResourcePath={getResourcePath}
        alt="Logo"
        className="h-20"
    />
</div>
```

- [ ] **Step 2: Replace logo block in `RegisterPage.tsx`**

Remove the import:

```tsx
import { getLoginLogoUrl } from "../utils/logo";
```

Add the new import:

```tsx
import { Logo } from "@/components/Logo";
```

Replace the `<img>` block (currently around lines 212-217):

```tsx
<img 
    src={getLoginLogoUrl(i18n, "img/keycloak-logo-text.png", getResourcePath)}
    alt="Keycloak" 
    className="h-20"
/>
```

with:

```tsx
<Logo
    kcContext={kcContext}
    defaultLight="img/keycloak-logo-text.png"
    getResourcePath={getResourcePath}
    alt="Logo"
    className="h-20"
/>
```

- [ ] **Step 3: Add `useFavicon` to login PageWrapper**

Modify `src/login/components/PageWrapper.tsx`:

Add at the top of the imports:

```tsx
import { useFavicon } from "@/lib/useFavicon";
```

Inside the `PageWrapper` function, add this line **before** the existing `useEffect`:

```tsx
useFavicon(kcContext);
```

The order matters: favicon mount before the theme effect runs is fine — favicon update has no theme dependency.

- [ ] **Step 4: Delete the old logo helper**

```bash
git rm src/login/utils/logo.ts
```

- [ ] **Step 5: Add story variants to `Login.stories.tsx`**

Append to `src/login/pages/Login.stories.tsx` (after the last existing export):

```tsx
export const WithCustomLogo: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--logo-light:https://placehold.co/200x80/0066cc/white?text=Light+Logo-->" +
                        "<!--logo-dark:https://placehold.co/200x80/00ccff/black?text=Dark+Logo-->",
                },
            }}
        />
    ),
};

export const WithLightLogoOnly: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--logo-light:https://placehold.co/200x80/0066cc/white?text=Logo-->",
                },
            }}
        />
    ),
};

export const WithBrokenLogoUrl: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--logo-light:https://example.invalid/missing.png-->",
                },
            }}
        />
    ),
};

export const WithFavicon: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--favicon:https://placehold.co/32x32/ff00ff/white.png-->",
                },
            }}
        />
    ),
};
```

- [ ] **Step 6: Add the same story variants to `Register.stories.tsx`**

Append to `src/login/pages/Register.stories.tsx`:

```tsx
export const WithCustomLogo: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--logo-light:https://placehold.co/200x80/0066cc/white?text=Light+Logo-->" +
                        "<!--logo-dark:https://placehold.co/200x80/00ccff/black?text=Dark+Logo-->",
                },
            }}
        />
    ),
};

export const WithLightLogoOnly: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--logo-light:https://placehold.co/200x80/0066cc/white?text=Logo-->",
                },
            }}
        />
    ),
};

export const WithBrokenLogoUrl: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--logo-light:https://example.invalid/missing.png-->",
                },
            }}
        />
    ),
};
```

If `Register.stories.tsx` does not already declare `Story` or import `Meta`/`StoryObj`, follow the same import pattern as `Login.stories.tsx`.

- [ ] **Step 7: Build and visually verify**

Run: `npm run build`
Expected: succeeds with no TypeScript errors.

Run: `npm run storybook`
Expected: Storybook opens at http://localhost:6006.

In Storybook, open `login/login.ftl` and click through:
- `Default` — bundled default logo renders.
- `WithCustomLogo` — light-mode shows blue "Light+Logo" placeholder; toggle to dark mode (Storybook toolbar background) — shows "Dark+Logo".
- `WithLightLogoOnly` — same blue logo in both modes.
- `WithBrokenLogoUrl` — first render shows broken image briefly, then falls back to default.
- `WithFavicon` — open DevTools, check `<link rel="icon">` href is the placeholder URL.

Repeat for `login/register.ftl`.

- [ ] **Step 8: Commit**

```bash
git add src/login/pages/LoginPage.tsx src/login/pages/RegisterPage.tsx \
        src/login/components/PageWrapper.tsx \
        src/login/pages/Login.stories.tsx src/login/pages/Register.stories.tsx
# (src/login/utils/logo.ts was already staged by git rm)
git commit -m "feat: wire login theme to Logo component and useFavicon hook

Replaces the broken loginLogoUrl i18n mechanism with realm
displayNameHtml comment parsing. LoginPage and RegisterPage now
use the shared <Logo /> component. Login PageWrapper applies the
configured favicon at mount."
```

---

## Task 5: Wire the account theme

**Files:**
- Modify: `src/account/components/AccountLayout.tsx`
- Modify: `src/account/components/PageWrapper.tsx`
- Modify: `src/account/pages/Account.stories.tsx`

- [ ] **Step 1: Add logo render and `getResourcePath` to `AccountLayout.tsx`**

The current `AccountLayout` is a simple wrapper. We add a logo above the main content. Because the account theme has no existing `getResourcePath` helper, we define one inline using the same DEV/PROD branching the login theme uses (but with `/account/` instead of `/login/`).

Replace the entire contents of `src/account/components/AccountLayout.tsx` with:

```tsx
import { type KcContext } from "../KcContext";
import { Logo } from "@/components/Logo";
import { keycloakThemeConfig } from "config";

interface AccountLayoutProps {
    kcContext: KcContext;
    children: React.ReactNode;
}

export function AccountLayout({ kcContext, children }: AccountLayoutProps) {
    const { url, themeName } = kcContext as KcContext & { themeName?: string };

    const getResourcePath = (path: string) => {
        if (import.meta.env.DEV) {
            return `/keycloakify-dev-resources/account/${path}`;
        }
        let resourcesPath = (url as unknown as { resourcesPath?: string }).resourcesPath;
        const defaultThemeName = themeName || keycloakThemeConfig.themeName;
        if (!resourcesPath) {
            resourcesPath = `/resources/${defaultThemeName}`;
        }
        if (resourcesPath.includes("/account/")) {
            return `${resourcesPath}/dist/${path}`;
        }
        return `${resourcesPath}/account/${defaultThemeName}/dist/${path}`;
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex justify-center pt-32 md:pt-28">
                <Logo
                    kcContext={kcContext}
                    defaultLight="img/keycloak-logo-text.png"
                    getResourcePath={getResourcePath}
                    alt="Logo"
                    className="h-12"
                />
            </div>
            <main className="flex-1 px-4 md:px-6 py-6 flex items-center justify-center w-full pt-4">
                <div className="w-full max-w-4xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
```

Note: the original `<main>` used `pt-36 md:pt-32` to clear the fixed-position `PageHeader` (floating at `top-4`). We move that vertical offset onto the new logo container (`pt-32 md:pt-28`) and reduce `<main>`'s top padding to `pt-4` since the logo now sits between the floating header and the content. If the floating header visually overlaps the logo at some viewport widths, increase the logo container's top padding.

- [ ] **Step 2: Add `useFavicon` to account PageWrapper**

Modify `src/account/components/PageWrapper.tsx`:

Add at the top of the imports:

```tsx
import { useFavicon } from "@/lib/useFavicon";
```

Inside the `PageWrapper` function, add this line **before** the existing `useEffect`:

```tsx
useFavicon(kcContext);
```

- [ ] **Step 3: Add story variants to `Account.stories.tsx`**

Append to `src/account/pages/Account.stories.tsx`:

```tsx
export const WithCustomLogo: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--logo-light:https://placehold.co/200x80/0066cc/white?text=Light+Logo-->" +
                        "<!--logo-dark:https://placehold.co/200x80/00ccff/black?text=Dark+Logo-->",
                },
            }}
        />
    ),
};

export const WithFavicon: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--favicon:https://placehold.co/32x32/ff00ff/white.png-->",
                },
            }}
        />
    ),
};
```

- [ ] **Step 4: Build and visually verify**

Run: `npm run build`
Expected: succeeds.

Run: `npm run storybook`

In Storybook, open `account/account.ftl`:
- `Default` — default logo renders at the top.
- `WithCustomLogo` — light/dark placeholders switch with theme.
- `WithFavicon` — DevTools shows favicon `<link>` updated.

- [ ] **Step 5: Commit**

```bash
git add src/account/components/AccountLayout.tsx \
        src/account/components/PageWrapper.tsx \
        src/account/pages/Account.stories.tsx
git commit -m "feat: add dynamic logo and favicon to account theme

AccountLayout now renders <Logo /> above the main content, with
its own getResourcePath helper scoped to the account resources
path. PageWrapper applies the configured favicon at mount."
```

---

## Task 6: Update README

**Files:**
- Modify: `README.md` (the "Dynamic Logo Configuration" section, around lines 192-238)

- [ ] **Step 1: Locate and replace the section**

Find the section starting with `### Dynamic Logo Configuration` and ending just before `### Customization Strategies`.

Replace its entire contents with:

```markdown
### Dynamic Logo & Favicon Configuration

You can change the logo (both light/dark variants) and favicon dynamically through the Keycloak Admin Console without rebuilding the theme. Configuration is embedded as HTML comments inside the realm's **Display Name HTML** field.

#### How to Configure

1. **Access Keycloak Admin Console**
   - Navigate to your realm
   - Go to **Realm Settings** → **General**
   - Locate the **Display name HTML** field

2. **Add Logo / Favicon Comments**

   Append (or replace) HTML comments using this format:

   ```html
   <strong>My Realm</strong>
   <!--logo-light:https://cdn.example.com/logo.png-->
   <!--logo-dark:https://cdn.example.com/logo-dark.png-->
   <!--favicon:https://cdn.example.com/favicon.ico-->
   ```

   Each comment is one key / value pair. Any non-comment HTML you put in this field continues to work as the realm's display name. Order does not matter. Unknown keys are ignored.

3. **Save Changes**
   - Click **Save**
   - Logo + favicon update immediately on next page load — no theme rebuild needed.

#### Supported Keys

- `logo-light` — Logo shown in light mode (and in dark mode if `logo-dark` is absent).
- `logo-dark` — Logo shown in dark mode. Falls back to `logo-light`, then to the bundled default.
- `favicon` — Browser tab icon. If absent, the bundled favicon is preserved.

#### Supported Value Formats

- **External URL:** `https://cdn.example.com/logo.png`
- **Data URI:** `data:image/png;base64,iVBORw0KGgo...`
- **Absolute path:** `/themes/my-theme/.../logo.png` (Keycloak-served resource)

#### Fallback Behaviour

If a key is missing or the URL fails to load, the theme falls back to the bundled default logo (`img/keycloak-logo-text.png`) or the bundled favicon (`public/favicon-32x32.png`). Pages still render — the logo is never blocking.

#### Where the Logo Appears

- **Login theme:** Top of the Login and Register pages.
- **Account theme:** Top of the account console.
- **Favicon:** Browser tab on both themes.

Other login pages (password reset, OTP, etc.) do not display a logo by default; this is a separate UX decision unrelated to dynamic logo configuration.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite Dynamic Logo Configuration section for displayNameHtml approach

Replaces the documentation for the removed loginLogoUrl i18n
mechanism. Covers light/dark variants, favicon, and the
displayNameHtml comment format."
```

---

## Task 7: Real-Keycloak smoke test

**Files:** none (verification only — no commits).

- [ ] **Step 1: Build the theme JAR**

Run: `npm run build-keycloak-theme`
Expected: succeeds; JARs land in `dist_keycloak/`.

- [ ] **Step 2: Deploy to a local Keycloak**

If you don't have a local Keycloak:

```bash
docker run --rm -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v "$(pwd)/dist_keycloak":/opt/keycloak/providers \
  quay.io/keycloak/keycloak:26.0 start-dev
```

Wait for Keycloak to come up at http://localhost:8080.

- [ ] **Step 3: Configure a realm to use the theme**

In Admin Console:
1. Create or open a realm.
2. **Realm Settings → Themes**: set Login Theme and Account Theme to `keycloak-shadcn` (or your configured theme name).
3. **Realm Settings → General → Display name HTML**: paste:

   ```
   <strong>Test Realm</strong>
   <!--logo-light:https://placehold.co/200x80/0066cc/white?text=Light-->
   <!--logo-dark:https://placehold.co/200x80/00ccff/black?text=Dark-->
   <!--favicon:https://placehold.co/32x32/ff00ff/white.png-->
   ```
4. **Save**.

- [ ] **Step 4: Verify login pages**

Open the realm's login page (e.g., http://localhost:8080/realms/<realm>/account → triggers login).

Check:
- Light-mode logo is the blue "Light" placeholder.
- Switch to dark mode (theme toggle, bottom bar). Logo becomes the cyan "Dark" placeholder.
- Browser tab favicon is the magenta placeholder.
- Same checks on the Register page (use the "Register" link).

- [ ] **Step 5: Verify account pages**

Log into the account console. Check:
- Logo at top of the page shows the placeholder.
- Dark mode switches the variant.
- Favicon is the magenta placeholder.

- [ ] **Step 6: Verify the fallback path**

Remove the comments from Display name HTML and save. Reload the login page. Expected: bundled `keycloak-logo-text.png` appears in light and dark; favicon is the bundled `favicon-32x32.png`.

- [ ] **Step 7: Report results**

If any of the above fail, file a bug describing what you observed vs expected — do not patch from this plan. The implementation is complete only if all checks above pass.

---

## Self-review notes

- Spec coverage: every requirement (parser, Logo component, useFavicon hook, login + account coverage, dark mode, error handling, README docs) maps to a task above.
- No placeholders: every code block is complete and pastable.
- Type consistency: `RealmLogoConfig` shape (`light?`, `dark?`, `favicon?`), `parseRealmLogoConfig` signature, and `<Logo />` props match across Tasks 1, 2, 3, 4, 5.
- Account theme `getResourcePath` mirrors login's pattern (DEV vs PROD branching, theme-name fallback) — but with `/account/` instead of `/login/`. If the path layout in production turns out to differ from login (it should not, by Keycloakify convention), adjust the `includes("/account/")` branch.
