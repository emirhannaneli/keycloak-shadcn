# Dynamic Logo & Favicon — Design

**Date:** 2026-05-25
**Status:** Approved for implementation
**Scope:** Login theme + Account theme + favicon. Email theme is out of scope (follow-up).

## Problem

The current dynamic logo mechanism (`src/login/utils/logo.ts#getLoginLogoUrl`) reads a `loginLogoUrl` i18n message key set in Keycloak Admin → Realm Settings → Localization. In practice it does not work for users: the realm must have `internationalizationEnabled = true` and the key must be set under the active locale, otherwise the theme always shows the default logo. Beyond the bug, using the i18n message system as a config store is a misuse — it is per-locale (so a single logo URL must be duplicated across every language), the admin UX implies "translation" not "branding", and it does not naturally accommodate multiple related values (light/dark logo, favicon).

The current implementation also covers only `LoginPage` and `RegisterPage`, has no light/dark variant support, no account-theme logo at all, and a static favicon baked at build time.

## Goals

1. A single realm-level config source for: light logo, dark logo, favicon — readable at runtime, no theme rebuild required.
2. Logo visible on the existing login pages (`LoginPage`, `RegisterPage`) and the account console (`AccountSidebar`).
3. Favicon updated dynamically in the browser tab on both themes.
4. Independent of `realm.internationalizationEnabled`.
5. Light/dark logo variants, automatic selection from the active theme (including system-mode following).
6. Graceful fallback to the bundled default whenever config is missing, malformed, or the URL fails to load.

## Non-goals

- Email theme support (deferred — needs `npx keycloakify initialize-email-theme` and FreeMarker-side logic).
- Adding logos to login pages that currently do not display one (ResetPassword, OTP, Terms, etc.) — a separate UX decision.
- Per-user (vs per-realm) logo customization.
- A standalone admin UI for editing the logo — admin uses the existing realm settings field.
- Multi-resolution favicon support (one URL applies to all `<link rel="icon">` entries).

## Approach

Embed config as HTML comments inside the realm's existing **Display Name HTML** field (`Realm Settings → General → Display name HTML`), which Keycloak surfaces to the theme as `kcContext.realm.displayNameHtml`. Comments are invisible in the rendered display name, so the field continues to work for its primary purpose.

### Config format

```html
<strong>Acme Corp</strong>
<!--logo-light:https://cdn.acme.com/logo.svg-->
<!--logo-dark:https://cdn.acme.com/logo-dark.svg-->
<!--favicon:https://cdn.acme.com/favicon.ico-->
```

- Each key/value pair is its own HTML comment of the form `<!--<key>:<value>-->`.
- Keys: `logo-light`, `logo-dark`, `favicon`. Unknown keys are ignored.
- Values may be: absolute URL (`http(s)://...`), data URI (`data:image/*;base64,...`), or a path starting with `/` (Keycloak resources).
- Order is irrelevant. Free HTML (including the display name itself) can coexist with the comments.

JSON was considered and rejected: it forces admins to maintain a single block, fail-closed on a quoting mistake, and complicates partial edits. Independent comments are simpler to copy/paste per value.

## Architecture

Three new files. Both themes import from the shared `src/lib/`.

```
src/lib/realmLogoConfig.ts     // pure parser
src/lib/useFavicon.ts          // React hook, injects <link rel="icon">
src/components/Logo.tsx         // <Logo /> React component, dark-mode aware
```

The existing `src/login/utils/logo.ts` is **deleted**; the i18n `loginLogoUrl` mechanism is fully replaced (we do not keep two half-working systems in parallel).

### `realmLogoConfig.ts` — parser

```ts
export type RealmLogoConfig = {
  light?: string;
  dark?: string;
  favicon?: string;
};

export function parseRealmLogoConfig(
  displayNameHtml: string | undefined | null
): RealmLogoConfig;
```

- Regex: `/<!--(logo-light|logo-dark|favicon):([^>]+?)-->/g`
- Whitespace around values is trimmed.
- On duplicate keys, the first match wins.
- Empty values (`<!--logo-light:-->`) are treated as absent.
- No URL validation: `<img onError>` handles broken URLs at render time. Single layer of defense.

### `<Logo />` — component

```tsx
type LogoProps = {
  kcContext: { realm?: { displayNameHtml?: string } };
  defaultLight: string;          // path passed verbatim to getResourcePath
  defaultDark?: string;          // optional; falls back to defaultLight if absent
  getResourcePath: (path: string) => string;
  className?: string;
  alt: string;
};
```

Renders two `<img>` elements stacked, one visible per theme. Tailwind's class-based dark mode:

```tsx
<>
  <img src={lightSrc} alt={alt} className={cn(className, "block dark:hidden")}
       onError={...} />
  <img src={darkSrc}  alt={alt} className={cn(className, "hidden dark:block")}
       onError={...} />
</>
```

Source resolution:
- `lightSrc = config.light ?? getResourcePath(defaultLight)`
- `darkSrc  = config.dark  ?? config.light ?? getResourcePath(defaultDark ?? defaultLight)`

So a realm that sets only `logo-light` gets the same logo in both modes; a realm that sets only `logo-dark` is treated as an edge case (still falls back to default light in light mode).

`onError` swaps `src` to the bundled default once; a state flag prevents a second error from looping if the default itself is missing.

A `getResourcePath` function is passed in as a prop. Each call site already maintains its own resolver (login pages and the account layout) because resource path resolution is non-trivial: it needs a DEV-mode branch (`/keycloakify-dev-resources/login/...`) and a fallback to the configured theme name when `kcContext.url.resourcesPath` is missing. Threading the function through keeps the component decoupled from those concerns and lets each theme pass its own theme-scoped resolver (`/login/` vs `/account/`).

### `useFavicon` — hook

```ts
function useFavicon(kcContext: { realm?: { displayNameHtml?: string } }): void;
```

Runs on mount in each theme's `PageWrapper`. Steps:

1. Parse config via `parseRealmLogoConfig`.
2. If `config.favicon` is absent, return (do not touch the existing `<link rel="icon">`).
3. Otherwise, set `href` on all existing `<link rel="icon">` elements in `document.head` (preserves their `sizes`/`type` attributes). If none exist, append a new `<link rel="icon" href="...">`.

Each Keycloak page is a fresh document (full reload between FreeMarker pages), so the hook does not need to track `displayNameHtml` changes — it just runs on mount.

## Coverage

| Location | Before | After |
|---|---|---|
| `src/login/pages/LoginPage.tsx` | inline `<img>` + `getLoginLogoUrl` | `<Logo defaultLight="img/keycloak-logo-text.png" alt="Logo" className="h-20" />` |
| `src/login/pages/RegisterPage.tsx` | inline `<img>` + `getLoginLogoUrl` | same as above |
| Other login pages | no logo | unchanged |
| `src/login/components/PageWrapper.tsx` | theme effect | + `useFavicon(kcContext)` |
| `src/account/components/AccountLayout.tsx` | no logo | new `<Logo className="h-12" />` above the main content area |
| `src/account/components/PageWrapper.tsx` | theme effect | + `useFavicon(kcContext)` |
| `src/login/utils/logo.ts` | exports `getLoginLogoUrl` | **file deleted** |

Default fallbacks:
- Login logo: `img/keycloak-logo-text.png`
- Account logo: `img/keycloak-logo-text.png`
- Favicon: bundled `public/favicon-32x32.png` (untouched if no realm config)

## Dark mode interaction

`<html class="dark">` is toggled by `PageWrapper`'s existing theme effect (light / dark / system, persisted in `localStorage` as `theme`). `<Logo />` reads no state — it relies on CSS class selection (`dark:hidden` / `dark:block`).

A brief flash of the light-mode logo on first paint is possible if the user has dark mode and the theme effect runs after the first render. This matches the existing behavior of every other dark-mode-aware element on these pages (e.g., `ThemeSwitcher`). It is not new and not worsened.

Both rendered `<img>` elements are downloaded by the browser even though one is `display:none`. Accepted cost — logos are small and CDN-backed. `<picture>`/`<source>` cannot be used because the theme dark mode is class-driven, not `prefers-color-scheme`-driven.

## Error handling

### Parser

| Input | Result |
|---|---|
| `undefined`, `null`, `""` | `{}` |
| No comments present | `{}` |
| Unknown key | ignored |
| Duplicate key | first wins, silently |
| Value contains `>` | comment terminates early — accepted limit; admin can URL-encode |
| Empty value | field absent (`{}`) |
| Whitespace around value | trimmed |

No `console.warn` is emitted — the login console stays clean.

### Component

| Scenario | Result |
|---|---|
| Custom URL returns 404 | `onError` swaps to default once; state flag prevents loop |
| `kcContext.realm` undefined | parser returns `{}` → all defaults |
| `kcContext.url.resourcesPath` undefined | `?? ""` → relative path; theme still renders |

### `useFavicon`

| Scenario | Result |
|---|---|
| No `favicon` in config | no-op; bundled favicon preserved |
| Favicon URL 404 | browser's default behavior (falls back to its own default favicon) |
| No existing `<link rel="icon">` | new `<link>` appended to `<head>` |
| Multiple `<link rel="icon">` (sizes variants) | all `href`s set to the same URL (multi-resolution lost — acceptable, admin set a single URL) |

## Testing

No new test runner. Verification through:

1. **Storybook story variants** — extend existing `Login.stories.tsx`, `Register.stories.tsx`, and add equivalents for the account pages. New stories per theme:
   - `WithCustomLogo` — both `logo-light` and `logo-dark` set.
   - `WithLightLogoOnly` — only `logo-light`; dark mode reuses it.
   - `WithDarkLogoOnly` — only `logo-dark`; light mode uses default.
   - `WithBrokenLogoUrl` — URL returns 404; visually verify default fallback.
   - `WithFavicon` — `favicon` set; visually verify `<link rel="icon">` href via DevTools.
   Story args override `kcContext.realm.displayNameHtml`.
2. **Dev-mode manual test** — uncomment the `getKcContextMock` block in `src/main.tsx`, set `overrides.realm.displayNameHtml` with various comment combinations, run `npm run dev`, validate in browser.
3. **Real-Keycloak smoke test (before merging)** — `npm run build-keycloak-theme`, deploy the JAR to a local Keycloak, edit the realm's Display name HTML in admin, open login + account pages, toggle dark mode, confirm favicon in tab. Not automated.

## Follow-ups (out of this spec)

- **Email theme**: initialize via `npx keycloakify initialize-email-theme`, then add FreeMarker logic to parse `${realm.displayNameHtml!""}` and inject the appropriate logo URL into email templates. Light/dark not applicable (emails do not theme-switch).
- **Logo on additional login pages**: if a UX decision is made to show the logo on ResetPassword / OTP / Terms / etc., it becomes a one-line `<Logo />` insertion per page.
- **Documentation**: README's "Dynamic Logo Configuration" section needs rewriting once this lands — current docs describe the i18n key approach that is being removed.
