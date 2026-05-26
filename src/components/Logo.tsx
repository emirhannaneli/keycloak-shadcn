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
    /** Optional explicit height in pixels. Overrides className h-* if provided. */
    heightPx?: number;
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
    heightPx,
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

    const inlineStyle = heightPx ? { height: `${heightPx}px` } : undefined;

    return (
        <>
            <img
                src={lightFailed ? fallbackLight : lightSrc}
                style={inlineStyle}
                alt={alt}
                className={cn(className, "block dark:hidden")}
                onError={() => {
                    if (!lightFailed) setLightFailed(true);
                }}
            />
            <img
                src={darkFailed ? fallbackDark : darkSrc}
                style={inlineStyle}
                alt={alt}
                className={cn(className, "hidden dark:block")}
                onError={() => {
                    if (!darkFailed) setDarkFailed(true);
                }}
            />
        </>
    );
}
