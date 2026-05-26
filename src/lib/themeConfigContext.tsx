import { createContext, useContext, type ReactNode } from "react";
import type { ThemeConfig } from "./themeConfig";

const ThemeConfigContext = createContext<ThemeConfig>({});

export function ThemeConfigProvider({
    value,
    children,
}: {
    value: ThemeConfig;
    children: ReactNode;
}) {
    return (
        <ThemeConfigContext.Provider value={value}>
            {children}
        </ThemeConfigContext.Provider>
    );
}

/**
 * Consumes the ThemeConfig provided by the nearest PageWrapper. Returns an
 * empty object when no provider is present (e.g., in isolated unit tests).
 */
export function useThemeConfigContext(): ThemeConfig {
    return useContext(ThemeConfigContext);
}
