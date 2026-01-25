import type { I18n } from "../i18n";
import { ReactElement, isValidElement } from "react";

/**
 * Recursively extracts text content from ReactElement
 */
function extractTextFromReactElement(element: any): string {
    if (typeof element === "string") {
        return element;
    }
    
    if (typeof element === "number") {
        return String(element);
    }
    
    if (element == null || element === undefined) {
        return "";
    }
    
    if (Array.isArray(element)) {
        return element.map(extractTextFromReactElement).filter(Boolean).join("");
    }
    
    // First check dangerouslySetInnerHTML (for HTML content)
    if (element && typeof element === "object") {
        if ("props" in element && element.props?.dangerouslySetInnerHTML) {
            return element.props.dangerouslySetInnerHTML.__html || "";
        }
    }
    
    if (isValidElement(element)) {
        const reactElement = element as ReactElement;
        if (reactElement.props) {
            // Extract children if they exist
            if ("children" in reactElement.props) {
                const childrenText = extractTextFromReactElement(reactElement.props.children);
                if (childrenText) {
                    return childrenText;
                }
            }
            // If no children but other props exist, check them
            if (reactElement.props.dangerouslySetInnerHTML) {
                return reactElement.props.dangerouslySetInnerHTML.__html || "";
            }
        }
        return "";
    }
    
    // If it's an object and has toString method, use it
    if (typeof element === "object") {
        // For non-React element objects
        if (element.toString && element.toString !== Object.prototype.toString) {
            const str = element.toString();
            if (str !== "[object Object]") {
                return str;
            }
        }
        // Check values inside the object
        if ("children" in element) {
            const childrenText = extractTextFromReactElement(element.children);
            if (childrenText) {
                return childrenText;
            }
        }
        if ("props" in element && element.props) {
            if ("dangerouslySetInnerHTML" in element.props) {
                return element.props.dangerouslySetInnerHTML?.__html || "";
            }
            if ("children" in element.props) {
                const childrenText = extractTextFromReactElement(element.props.children);
                if (childrenText) {
                    return childrenText;
                }
            }
        }
    }
    
    // Last resort: return empty string
    return "";
}

/**
 * i18n.msg() returns ReactElement, this helper should be used to convert to string
 * Parameters are also supported:
 * - i18nToString(i18n, "key", { 0: value }) - Keycloak format
 * - i18nToString(i18n, "key", value) - Shortcut for single parameter
 * 
 * If the result contains placeholders like {0}, {1}, {2} and realm info is provided,
 * they are automatically replaced with the realm name.
 */
export function i18nToString(
    i18n: I18n, 
    key: Parameters<I18n["msg"]>[0],
    params?: { [key: number]: any } | string | number,
    realmName?: string
): string {
    try {
        // In Keycloak, parameterized messages are passed in object format: { 0: value }
        // If string or number is passed, convert to { 0: value } format
        let paramObj: { [key: number]: any } | undefined = undefined;
        if (params !== undefined) {
            if (typeof params === "object" && !Array.isArray(params) && params !== null) {
                // Already in object format
                paramObj = params as { [key: number]: any };
            } else {
                // If string or number, convert to { 0: value } format
                paramObj = { 0: params };
            }
        }
        
        // i18n.msg() accepts parameters in object format
        const result = paramObj !== undefined 
            ? (i18n.msg as any)(key, paramObj)
            : (i18n.msg as any)(key);
        
        // If already a string, return directly
        if (typeof result === "string") {
            // If the key itself is returned (not translated), return empty string
            // However, messages from Keycloak realm localization can also return as string
            // That's why we check for exact match with key
            if (result === String(key) || result.trim() === "") {
                return "";
            }
            return result;
        }
        
        // If ReactElement or another object, extract text content
        const extracted = extractTextFromReactElement(result);
        
        // If still "[object Object]" or empty, or key itself is returned, return empty string
        if (extracted === "[object Object]" || extracted === "" || extracted === String(key)) {
            return "";
        }
        
        // If result contains {0} placeholder and realm name is provided, replace it
        if (realmName && extracted.includes("{0}")) {
            return extracted.replace("{0}", realmName);
        }
        
        return extracted;
    } catch (error) {
        // In case of error, return the key
        console.warn(`i18nToString error for key "${key}":`, error);
        return String(key);
    }
}

/**
 * Translates attribute displayName using i18n
 * Uses i18n keys for standard fields (username, email, firstName, lastName)
 * Uses attribute.displayName or attribute.name for other fields
 */
export function getAttributeDisplayName(
    i18n: I18n,
    attribute: { name: string; displayName?: string }
): string {
    const attributeName = attribute.name;
    
    // Use i18n keys for standard fields
    const standardFieldMap: Record<string, string> = {
        username: "username",
        email: "email",
        firstName: "firstName",
        lastName: "lastName",
        password: "password",
        "password-confirm": "passwordConfirm",
        "password-new": "passwordNew",
        "password-new-confirm": "passwordNewConfirm",
    };
    
    const i18nKey = standardFieldMap[attributeName];
    if (i18nKey) {
        const translated = i18nToString(i18n, i18nKey as any);
        if (translated && translated !== i18nKey) {
            return translated;
        }
    }
    
    // If no i18n translation, use attribute.displayName or attribute.name
    return attribute.displayName || attributeName;
}

