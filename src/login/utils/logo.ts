import type { I18n } from "../i18n";

/**
 * Login sayfası için logo URL'ini dinamik olarak belirler.
 * 
 * Öncelik Sırası:
 * 1. Admin Panel -> Realm Settings -> Localization -> "loginLogoUrl" değeri
 * 2. Kod içinde belirtilen varsayılan logo (defaultLogoPath)
 * 
 * @param i18n - Keycloakify i18n nesnesi
 * @param defaultLogoPath - Varsayılan logo yolu (örn: "img/logo.png")
 * @param getResourcePath - Resource path oluşturucu fonksiyon
 */
export function getLoginLogoUrl(
    i18n: I18n,
    defaultLogoPath: string,
    getResourcePath: (path: string) => string
): string {
    const KEY_LOGIN_LOGO_URL = "loginLogoUrl";

    // advancedMsgStr kullan - key bulunamazsa key'in kendisini döndürür, hata fırlatmaz
    const result = i18n.advancedMsgStr(KEY_LOGIN_LOGO_URL).trim();

    // Geçerli bir URL mi kontrol et
    // - Boş olmamalı
    // - Key'in kendisi olmamalı (bulunamadı demek)
    // - URL benzeri olmalı (http/https ile başlamalı veya data: ile başlamalı veya / ile başlamalı)
    const isValidUrl = 
        result !== "" &&
        result !== KEY_LOGIN_LOGO_URL &&
        (result.startsWith("http://") || 
         result.startsWith("https://") || 
         result.startsWith("data:") ||
         result.startsWith("/"));

    if (isValidUrl) {
        return result;
    }

    // Geçerli URL bulunamazsa varsayılan logo
    return getResourcePath(defaultLogoPath);
}