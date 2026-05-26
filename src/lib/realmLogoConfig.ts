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

function looksLikeUrl(value: string): boolean {
    return (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("data:") ||
        value.startsWith("/")
    );
}

/**
 * Parses logo / favicon URLs out of HTML comments embedded in a realm's
 * `displayNameHtml`. Two input formats are accepted:
 *
 * 1. **Comment format** (full control over light/dark/favicon):
 *
 *        <!--logo-light:https://cdn.example.com/logo.png-->
 *        <!--logo-dark:data:image/png;base64,...-->
 *        <!--favicon:/themes/x/favicon.ico-->
 *
 * 2. **Plain URL shorthand** (most common case — admin pastes one URL):
 *
 *        https://cdn.example.com/logo.png
 *
 *    Treated as `logo-light` only; dark mode uses the same URL via the
 *    Logo component's fallback chain.
 *
 * Unknown comment keys are ignored. Duplicates: first wins. Empty values are
 * absent. URLs are not validated beyond the shape check — broken URLs surface
 * via `<img onError>` downstream.
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

    // Plain URL shorthand: if no comments matched and the trimmed input itself
    // looks like a URL, treat it as logo-light. This is the common admin path —
    // they paste a URL into "Display name HTML" without learning the comment
    // syntax. We don't activate this when ANY comments matched, so the formats
    // don't fight each other.
    if (Object.keys(result).length === 0) {
        const trimmed = displayNameHtml.trim();
        if (looksLikeUrl(trimmed)) {
            result.light = trimmed;
        }
    }

    return result;
}
