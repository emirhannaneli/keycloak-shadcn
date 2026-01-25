import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type KcContext } from "../KcContext";

interface LanguageSwitcherProps {
    kcContext: KcContext;
}

const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "zh-CN", name: "中文", flag: "🇨🇳" },
];

export function LanguageSwitcher({ kcContext }: LanguageSwitcherProps) {
    const currentLanguage = kcContext.locale?.currentLanguageTag || "en";

    const handleLanguageChange = (langCode: string) => {
        // Use kc_locale parameter for language change in Keycloak login pages
        // Get current URL and add/update kc_locale parameter
        try {
            const currentUrl = new URL(window.location.href);
            
            // Preserve all existing query parameters, only update kc_locale
            currentUrl.searchParams.set("kc_locale", langCode);
            
            // Reload the page
            window.location.href = currentUrl.toString();
        } catch (e) {
            // Try a simple approach in case of URL parse error
            console.warn("Failed to parse URL:", e);
            // If kc_locale already exists in current URL, replace it
            const urlWithoutLocale = window.location.href.replace(/[?&]kc_locale=[^&]*/, "");
            const newSeparator = urlWithoutLocale.includes("?") ? "&" : "?";
            window.location.href = `${urlWithoutLocale}${newSeparator}kc_locale=${langCode}`;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Languages className="h-4 w-4" />
                    <span className="sr-only">Dil</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center" className="max-h-[300px] overflow-y-auto">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="cursor-pointer"
                    >
                        <span className="mr-2 text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                        {(currentLanguage === lang.code || currentLanguage.startsWith(lang.code + "-")) && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

