import { type KcContext } from "../KcContext";
import { Logo } from "@/components/Logo";
import { keycloakThemeConfig } from "config";
import { useThemeConfigContext } from "@/lib/themeConfigContext";

interface AccountLayoutProps {
    kcContext: KcContext;
    children: React.ReactNode;
}

export function AccountLayout({ kcContext, children }: AccountLayoutProps) {
    const { url, themeName } = kcContext as KcContext & { themeName?: string };
    const themeConfig = useThemeConfigContext();
    const heightPx = parseInt(themeConfig.logoHeightAccount ?? "0", 10) || undefined;

    const getResourcePath = (path: string) => {
        if (import.meta.env.DEV) {
            return `/keycloakify-dev-resources/account/${path}`;
        }
        let resourcesPath = (url as unknown as { resourcesPath?: string }).resourcesPath;
        const defaultThemeName = themeName || keycloakThemeConfig.themeName;
        if (!resourcesPath) {
            resourcesPath = `/resources/${defaultThemeName}`;
        }
        if (resourcesPath.includes("/account/")) {
            return `${resourcesPath}/dist/${path}`;
        }
        return `${resourcesPath}/account/${defaultThemeName}/dist/${path}`;
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex justify-center pt-32 md:pt-28">
                <Logo
                    kcContext={kcContext as unknown as { realm?: { displayNameHtml?: string } }}
                    defaultLight="img/keycloak-logo-text.png"
                    getResourcePath={getResourcePath}
                    alt="Logo"
                    className="h-12"
                    heightPx={heightPx}
                />
            </div>
            <main className="flex-1 px-4 md:px-6 pb-6 flex items-center justify-center w-full pt-4">
                <div className="w-full max-w-4xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
