/**
 * Realm theme config loaded from the Theme Config SPI
 * (`/realms/{realm}/theme-config`). Keys are the well-known names with the
 * `theme.` prefix stripped — e.g. `logoLight`, `logoDark`, `faviconUrl`, plus
 * any other `theme.*` attribute the admin sets on the realm.
 */
export type ThemeConfig = Record<string, string>;

const CACHE_KEY = "kc-theme-config";
const CACHE_TTL_MS = 30 * 1000; // 30 seconds — matches SPI Cache-Control

type CacheEntry = { realm: string; data: ThemeConfig; ts: number };

/**
 * Reads a fresh cache entry for the given realm. Returns null if the cache is
 * absent, belongs to a different realm, expired, or unparseable. All errors
 * (Safari private mode, JSON parse failures) are swallowed.
 */
export function readCache(realm: string): ThemeConfig | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const entry = JSON.parse(raw) as CacheEntry;
        if (entry.realm !== realm) return null;
        if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
        return entry.data;
    } catch {
        return null;
    }
}

export function writeCache(realm: string, data: ThemeConfig): void {
    try {
        const entry: CacheEntry = { realm, data, ts: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {
        // QuotaExceeded, private mode, etc. — silent
    }
}

/**
 * Fetches the realm theme config from the SPI. Uses a relative URL — login
 * pages are always served from the same Keycloak origin, so no base URL or
 * CORS concerns. Throws on non-2xx or malformed JSON.
 */
export async function fetchThemeConfig(realmName: string): Promise<ThemeConfig> {
    const url = `/realms/${encodeURIComponent(realmName)}/theme-config`;
    const res = await fetch(url, { credentials: "omit" });
    if (!res.ok) throw new Error(`theme-config ${res.status}`);
    return res.json();
}
