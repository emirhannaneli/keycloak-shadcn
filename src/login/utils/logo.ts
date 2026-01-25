import type { I18n } from "../i18n";

/**
 * Dynamically determines the logo URL for the login page.
 * 
 * Priority Order:
 * 1. Admin Panel -> Realm Settings -> Localization -> "loginLogoUrl" value
 * 2. Default logo specified in code (defaultLogoPath)
 * 
 * @param i18n - Keycloakify i18n object
 * @param defaultLogoPath - Default logo path (e.g., "img/logo.png")
 * @param getResourcePath - Resource path generator function
 */
export function getLoginLogoUrl(
    i18n: I18n,
    defaultLogoPath: string,
    getResourcePath: (path: string) => string
): string {
    const KEY_LOGIN_LOGO_URL = "loginLogoUrl";

    // Use advancedMsgStr - returns the key itself if not found, doesn't throw error
    const result = i18n.advancedMsgStr(KEY_LOGIN_LOGO_URL).trim();

    // Check if it's a valid URL
    // - Should not be empty
    // - Should not be the key itself (means not found)
    // - Should be URL-like (should start with http/https or data: or /)
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

    // If no valid URL found, use default logo
    return getResourcePath(defaultLogoPath);
}