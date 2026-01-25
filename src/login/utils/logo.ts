import type { I18n } from "../i18n";
import { i18nToString } from "./i18n";

/**
 * Login sayfası için logo URL'ini dinamik olarak alır.
 * 
 * Keycloak Admin Console -> Realm Settings -> Localization üzerinden
 * `loginLogoUrl` mesaj anahtarı ile logo URL'i veya Base64 string'i tanımlanabilir.
 * 
 * @param i18n - i18n instance
 * @param defaultLogoPath - Varsayılan logo path'i (örn: "img/keycloak-logo-text.png")
 * @param getResourcePath - Resource path oluşturma fonksiyonu
 * @returns Logo URL'i veya Base64 string'i. Eğer tanımlanmamışsa varsayılan logo path'i.
 * 
 * @example
 * // Admin panelde tanımlanmamışsa:
 * getLoginLogoUrl(i18n, "img/keycloak-logo-text.png", getResourcePath)
 * // -> "/resources/.../img/keycloak-logo-text.png"
 * 
 * @example
 * // Admin panelde URL tanımlanmışsa:
 * // loginLogoUrl = "https://example.com/logo.png"
 * getLoginLogoUrl(i18n, "img/keycloak-logo-text.png", getResourcePath)
 * // -> "https://example.com/logo.png"
 * 
 * @example
 * // Admin panelde Base64 tanımlanmışsa:
 * // loginLogoUrl = "data:image/png;base64,iVBORw0KG..."
 * getLoginLogoUrl(i18n, "img/keycloak-logo-text.png", getResourcePath)
 * // -> "data:image/png;base64,iVBORw0KG..."
 */
export function getLoginLogoUrl(
    i18n: I18n,
    defaultLogoPath: string,
    getResourcePath: (path: string) => string
): string {
    // loginLogoUrl mesaj anahtarını kontrol et
    const logoUrl = i18nToString(i18n, "loginLogoUrl" as any);
    
    // Eğer logoUrl tanımlanmışsa (boş string değilse ve key'in kendisi değilse), kullan
    if (logoUrl && logoUrl.trim() !== "" && logoUrl !== "loginLogoUrl") {
        return logoUrl.trim();
    }
    
    // Eğer tanımlanmamışsa, varsayılan logo path'ini kullan
    return getResourcePath(defaultLogoPath);
}
