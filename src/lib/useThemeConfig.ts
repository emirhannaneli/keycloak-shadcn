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
