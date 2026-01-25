import { type KcContext } from "../KcContext";
import { PageHeader } from "./PageHeader";
import { AccountLayout } from "./AccountLayout";
import { useEffect } from "react";

interface PageWrapperProps {
    kcContext: KcContext;
    children: React.ReactNode;
}

type Theme = "light" | "dark" | "system";

export function PageWrapper({ kcContext, children }: PageWrapperProps) {
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
        <AccountLayout kcContext={kcContext}>
            {children}
            <PageHeader kcContext={kcContext} />
        </AccountLayout>
    );
}

