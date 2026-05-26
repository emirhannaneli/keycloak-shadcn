import { useEffect } from "react";
import { parseRealmLogoConfig } from "./realmLogoConfig";
import type { ThemeConfig } from "./themeConfig";

/**
 * Updates <link rel="icon"> in document.head with the realm-configured favicon.
 * Priority order:
 *   1. ThemeConfig (SPI) — `faviconUrl`
 *   2. parseRealmLogoConfig(displayNameHtml).favicon — legacy
 *   3. no-op (bundled favicon preserved)
 *
 * Restores the previous state on unmount or when the resolved favicon changes —
 * for Storybook hygiene; production has full reloads between Keycloak pages.
 *
 * `themeConfig` is passed in (not read from context) because this hook is
 * called from PageWrapper itself, which lives outside the ThemeConfigProvider
 * it returns — a context read here would always see the default {}.
 */
export function useFavicon(
    themeConfig: ThemeConfig,
    kcContext: { realm?: { displayNameHtml?: string } }
) {
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
