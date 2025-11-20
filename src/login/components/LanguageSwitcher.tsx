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
        // Keycloak'ın default temalarında locale değişikliği için url.localeUrl(locale) function'ı kullanılır
        // Bu function, mevcut URL'ye kc_locale parametresini ekleyerek yeni bir URL döndürür
        const url = (kcContext as any).url;
        
        // Keycloak'ın locale URL mekanizmasını kontrol et
        if (url?.localeUrl && typeof url.localeUrl === "function") {
            try {
                // Keycloak'ın default temalarında url.localeUrl(locale) şeklinde çağrılır
                const localeUrl = url.localeUrl(langCode);
                if (localeUrl) {
                    // Keycloak'ın default temalarında bu URL'ye yönlendirme yapılır
                    window.location.href = localeUrl;
                    return;
                }
            } catch (e) {
                console.warn("url.localeUrl function call failed:", e);
            }
        }
        
        // Fallback: Keycloak'ın default temalarındaki mekanizmayı manuel olarak uygula
        // Mevcut URL'ye kc_locale parametresini ekle, tüm query parametrelerini koru
        const currentUrl = new URL(window.location.href);
        
        // Mevcut tüm query parametrelerini koru, sadece kc_locale'i güncelle veya ekle
        currentUrl.searchParams.set("kc_locale", langCode);
        
        // Keycloak'ın default temalarında sayfayı tamamen yeniden yükler
        window.location.href = currentUrl.toString();
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

