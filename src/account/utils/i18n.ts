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
            const html = element.props.dangerouslySetInnerHTML.__html || "";
            // Extract text from HTML (using simple regex)
            if (html) {
                return html.replace(/<[^>]*>/g, "").trim();
            }
        }
    }
    
    if (isValidElement(element)) {
        const reactElement = element as ReactElement;
        if (reactElement.props) {
            // Use dangerouslySetInnerHTML if it exists
            if (reactElement.props.dangerouslySetInnerHTML) {
                const html = reactElement.props.dangerouslySetInnerHTML.__html || "";
                if (html) {
                    return html.replace(/<[^>]*>/g, "").trim();
                }
            }
            // Extract children if they exist
            if ("children" in reactElement.props && reactElement.props.children !== undefined) {
                const childrenText = extractTextFromReactElement(reactElement.props.children);
                if (childrenText) {
                    return childrenText;
                }
            }
        }
        return "";
    }
    
    // If it's an object and has toString method, use it
    if (typeof element === "object" && element !== null) {
        if (typeof element.toString === "function") {
            const stringValue = element.toString();
            if (stringValue !== "[object Object]") {
                return stringValue;
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
            if (result === String(key) || result.trim() === "") {
                return "";
            }
            // If result contains {0} placeholder and realm name is provided, replace it
            if (realmName && result.includes("{0}")) {
                return result.replace(/\{0\}/g, realmName);
            }
            return result;
        }
        
        // If result is null or undefined, return empty string
        if (result == null) {
            return "";
        }
        
        // If ReactElement or another object, extract text content
        const extracted = extractTextFromReactElement(result);
        
        // If still "[object Object]" or empty, or key itself is returned, return empty string
        if (extracted === "[object Object]" || extracted === "" || extracted === String(key)) {
            return "";
        }
        
        // If result contains {0} placeholder and realm name is provided, replace it
        if (realmName && extracted.includes("{0}")) {
            return extracted.replace(/\{0\}/g, realmName);
        }
        
        return extracted;
    } catch (error) {
        // In case of error, return empty string (allow fallback)
        console.warn(`i18nToString error for key "${key}":`, error);
        return "";
    }
}

