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
            return () => {
                link.remove();
            };
        }

        const favicon = config.favicon;
        existing.forEach(link => {
            link.href = favicon;
        });
    }, [kcContext.realm?.displayNameHtml]);
}
