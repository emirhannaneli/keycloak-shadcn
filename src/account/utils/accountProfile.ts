import { useEffect, useRef, useState } from "react";
import Keycloak from "keycloak-js";

/**
 * Reproduces how the new Account Console (keycloak.v3) handles User Profile data.
 *
 * The legacy account.ftl FreeMarker context does NOT expose User Profile metadata
 * (input type, options, required, ...) the way the Register page does. So, exactly
 * like keycloak.v3, we:
 *   1. Obtain a token via the public `account-console` client with keycloak-js.
 *      `check-sso` redirects back to the account page's own URL, which is already a
 *      valid redirect URI for `account-console` by default — no extra Keycloak
 *      configuration required.
 *   2. Read the profile + metadata from the Account REST API
 *      (`GET {accountUrl}?userProfileMetadata=true`).
 *   3. Persist changes back through the same REST API (`POST {accountUrl}`).
 */

export type UserProfileAttributeMetadata = {
    name: string;
    displayName?: string;
    required?: boolean;
    readOnly?: boolean;
    multivalued?: boolean;
    group?: string;
    annotations?: Record<string, unknown>;
    validators?: Record<string, Record<string, unknown>>;
};

export type AccountProfile = {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    emailVerified?: boolean;
    attributes?: Record<string, string[]>;
    userProfileMetadata?: {
        attributes?: UserProfileAttributeMetadata[];
    };
};

export type AccountUpdatePayload = {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    attributes?: Record<string, string[]>;
};

export type AccountFieldError = {
    field?: string;
    errorMessage?: string;
    params?: unknown[];
};

export type SaveResult =
    | { ok: true }
    | { ok: false; errors: AccountFieldError[]; message?: string };

export type AccountProfileState =
    | { status: "loading" }
    | { status: "ready"; profile: AccountProfile }
    | { status: "error"; error: string };

export type AccountProfileApi = {
    state: AccountProfileState;
    /** Available only once `state.status === "ready"`. */
    save: ((payload: AccountUpdatePayload) => Promise<SaveResult>) | null;
};

/**
 * accountUrl looks like: https://host[/auth]/realms/{realm}/account
 * Derive the auth server base URL and realm so we can init keycloak-js.
 */
function parseAccountUrl(accountUrl: string): { authServerUrl: string; realm: string } | null {
    const match = accountUrl.match(/^(.*)\/realms\/([^/?#]+)\/account/);
    if (!match) return null;
    return { authServerUrl: match[1], realm: decodeURIComponent(match[2]) };
}

async function parseSaveErrors(res: Response): Promise<SaveResult> {
    let errors: AccountFieldError[] = [];
    let message: string | undefined;
    try {
        const body = await res.json();
        if (Array.isArray(body)) {
            errors = body as AccountFieldError[];
        } else if (Array.isArray(body?.errors)) {
            errors = body.errors as AccountFieldError[];
        } else if (typeof body?.errorMessage === "string") {
            message = body.errorMessage;
        } else if (typeof body?.error === "string") {
            message = body.error;
        }
    } catch {
        message = `${res.status} ${res.statusText}`;
    }
    return { ok: false, errors, message };
}

export function useAccountProfile(params: { accountUrl: string | undefined }): AccountProfileApi {
    const { accountUrl } = params;
    const [state, setState] = useState<AccountProfileState>({ status: "loading" });
    const keycloakRef = useRef<Keycloak | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fail = (message: string) => {
            if (!cancelled) setState({ status: "error", error: message });
        };

        if (!accountUrl) {
            fail("No accountUrl available in kcContext.");
            return;
        }
        const parsed = parseAccountUrl(accountUrl);
        if (!parsed) {
            fail(`Could not parse realm/authServerUrl from accountUrl: ${accountUrl}`);
            return;
        }

        (async () => {
            let token: string | undefined;
            try {
                const keycloak = new Keycloak({
                    url: parsed.authServerUrl,
                    realm: parsed.realm,
                    clientId: "account-console"
                });
                // check-sso redirects back to this page's own URL (already a valid
                // redirect URI for account-console) — same approach as keycloak.v3.
                await keycloak.init({
                    onLoad: "check-sso",
                    pkceMethod: "S256",
                    responseMode: "query",
                    checkLoginIframe: false
                });
                if (!keycloak.authenticated || !keycloak.token) {
                    fail("check-sso did not return a token (no active session for account-console).");
                    return;
                }
                keycloakRef.current = keycloak;
                token = keycloak.token;
            } catch (e) {
                fail(`keycloak-js init failed: ${e instanceof Error ? e.message : String(e)}`);
                return;
            }

            try {
                const sep = accountUrl.includes("?") ? "&" : "?";
                const res = await fetch(`${accountUrl}${sep}userProfileMetadata=true`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!res.ok) {
                    fail(`Account REST API responded ${res.status} ${res.statusText}`);
                    return;
                }
                const profile = (await res.json()) as AccountProfile;
                if (!cancelled) setState({ status: "ready", profile });
            } catch (e) {
                fail(`Account REST API request failed: ${e instanceof Error ? e.message : String(e)}`);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [accountUrl]);

    const save =
        state.status === "ready" && keycloakRef.current && accountUrl
            ? async (payload: AccountUpdatePayload): Promise<SaveResult> => {
                  const keycloak = keycloakRef.current!;
                  try {
                      await keycloak.updateToken(30);
                  } catch {
                      /* keep the existing token; the request will 401 if truly expired */
                  }
                  let res: Response;
                  try {
                      res = await fetch(accountUrl, {
                          method: "POST",
                          headers: {
                              "Content-Type": "application/json",
                              Accept: "application/json",
                              Authorization: `Bearer ${keycloak.token}`
                          },
                          body: JSON.stringify(payload)
                      });
                  } catch (e) {
                      return {
                          ok: false,
                          errors: [],
                          message: `Network error: ${e instanceof Error ? e.message : String(e)}`
                      };
                  }
                  if (res.status === 204 || res.ok) return { ok: true };
                  return parseSaveErrors(res);
              }
            : null;

    return { state, save };
}
