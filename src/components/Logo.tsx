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
    // When config.dark is absent we deliberately fall back to config.light so
    // dark mode shows the customised logo too; if that URL fails, both <img>s
    // fire onError independently and both fail-flags flip — intended.
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
