export type RealmLogoConfig = {
    light?: string;
    dark?: string;
    favicon?: string;
};

const KNOWN_KEYS = ["logo-light", "logo-dark", "favicon"] as const;
type KnownKey = (typeof KNOWN_KEYS)[number];

const KEY_TO_FIELD: Record<KnownKey, keyof RealmLogoConfig> = {
    "logo-light": "light",
    "logo-dark": "dark",
    "favicon": "favicon",
};

/**
 * Parses logo / favicon URLs out of HTML comments embedded in a realm's
 * `displayNameHtml`. Comments look like:
 *
 *   <!--logo-light:https://cdn.example.com/logo.png-->
 *   <!--logo-dark:data:image/png;base64,...-->
 *   <!--favicon:/themes/x/favicon.ico-->
 *
 * Unknown keys are ignored. Duplicates: first wins. Empty values are absent.
 * URLs are not validated — broken URLs surface via `<img onError>` downstream.
 */
export function parseRealmLogoConfig(
    displayNameHtml: string | undefined | null
): RealmLogoConfig {
    if (!displayNameHtml) {
        return {};
    }

    const result: RealmLogoConfig = {};
    const regex = /<!--(logo-light|logo-dark|favicon):([^>]+?)-->/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(displayNameHtml)) !== null) {
        const key = match[1] as KnownKey;
        const value = match[2].trim();
        const field = KEY_TO_FIELD[key];
        if (value !== "" && result[field] === undefined) {
            result[field] = value;
        }
    }

    return result;
}
