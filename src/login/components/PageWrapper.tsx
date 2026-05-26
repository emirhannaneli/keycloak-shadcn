import { type KcContext } from "../KcContext";
import { PageHeader } from "./PageHeader";
import { useEffect } from "react";
import { useFavicon } from "@/lib/useFavicon";
import { useThemeColors } from "@/lib/useThemeColors";
import { useThemeConfig } from "@/lib/useThemeConfig";
import { ThemeConfigProvider } from "@/lib/themeConfigContext";

interface PageWrapperProps {
    kcContext: KcContext;
    children: React.ReactNode;
}

type Theme = "light" | "dark" | "system";

export function PageWrapper({ kcContext, children }: PageWrapperProps) {
    const themeConfig = useThemeConfig(kcContext.realm.name);
    useFavicon(themeConfig, kcContext);
    useThemeColors(themeConfig);

    // Preserve theme state during page transitions
    useEffect(() => {
        const applyTheme = () => {
            const stored = localStorage.getItem("theme") as Theme | null;
            const root = document.documentElement;
            
            if (stored === "dark") {
                root.classList.add("dark");
            } else if (stored === "light") {
                root.classList.remove("dark");
            } else {
                // System theme
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                if (prefersDark) {
                    root.classList.add("dark");
                } else {
                    root.classList.remove("dark");
                }
            }
        };

        applyTheme();

        // Listen to system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            const stored = localStorage.getItem("theme") as Theme | null;
            if (stored === "system" || !stored) {
                applyTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [kcContext.pageId]); // Check theme state when page changes

    return (
        <ThemeConfigProvider value={themeConfig}>
            <div className="pb-20">{children}</div>
            <PageHeader kcContext={kcContext} />
        </ThemeConfigProvider>
    );
}

