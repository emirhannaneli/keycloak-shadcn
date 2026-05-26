import { useEffect } from "react";
import { hexToHslTuple } from "./themeColors";
import type { ThemeConfig } from "./themeConfig";

// Single-value colors — apply on :root so both light + dark modes pick them up.
const SHARED: Record<string, string[]> = {
    colorPrimary: ["--primary"],
    colorSecondary: ["--secondary"],
    // Accent also drives the focus ring colour.
    colorAccent: ["--accent", "--ring"],
};

// Mode-specific colours — emitted into :root { ... } and .dark { ... } blocks.
const LIGHT_MODE: Record<string, string[]> = {
    colorBackgroundLight: ["--background"],
    colorForegroundLight: ["--foreground"],
};

const DARK_MODE: Record<string, string[]> = {
    colorBackgroundDark: ["--background"],
    colorForegroundDark: ["--foreground"],
};

const STYLE_TAG_ID = "kc-theme-colors-override";

/**
 * Override Tailwind CSS variables at runtime from the realm's themeConfig.
 * Called once per PageWrapper. Applies shared colours inline on :root, and
 * mode-specific colours via a scoped <style id="kc-theme-colors-override">
 * block (because :root inline cannot express the .dark selector). Cleans up
 * on unmount / themeConfig change.
 */
export function useThemeColors(themeConfig: ThemeConfig): void {
    useEffect(() => {
        const root = document.documentElement;
        const sharedSet: string[] = [];

        for (const [cfgKey, vars] of Object.entries(SHARED)) {
            const hsl = themeConfig[cfgKey] ? hexToHslTuple(themeConfig[cfgKey]) : null;
            if (hsl) {
                vars.forEach(v => {
                    root.style.setProperty(v, hsl);
                    sharedSet.push(v);
                });
            }
        }

        let css = ":root {\n";
        for (const [cfgKey, vars] of Object.entries(LIGHT_MODE)) {
            const hsl = themeConfig[cfgKey] ? hexToHslTuple(themeConfig[cfgKey]) : null;
            if (hsl) vars.forEach(v => { css += `  ${v}: ${hsl};\n`; });
        }
        css += "}\n.dark {\n";
        for (const [cfgKey, vars] of Object.entries(DARK_MODE)) {
            const hsl = themeConfig[cfgKey] ? hexToHslTuple(themeConfig[cfgKey]) : null;
            if (hsl) vars.forEach(v => { css += `  ${v}: ${hsl};\n`; });
        }
        css += "}\n";

        const styleEl = document.createElement("style");
        styleEl.id = STYLE_TAG_ID;
        styleEl.textContent = css;
        document.head.appendChild(styleEl);

        return () => {
            styleEl.remove();
            sharedSet.forEach(v => root.style.removeProperty(v));
        };
    }, [themeConfig]);
}
