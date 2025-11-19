import type { I18n } from "../i18n";
import { ReactElement, isValidElement } from "react";

/**
 * ReactElement'den text content'ini recursive olarak çıkarır
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
    
    // Önce dangerouslySetInnerHTML'i kontrol et (HTML içerik için)
    if (element && typeof element === "object") {
        if ("props" in element && element.props?.dangerouslySetInnerHTML) {
            return element.props.dangerouslySetInnerHTML.__html || "";
        }
    }
    
    if (isValidElement(element)) {
        const reactElement = element as ReactElement;
        if (reactElement.props) {
            // children varsa onu çıkar
            if ("children" in reactElement.props) {
                const childrenText = extractTextFromReactElement(reactElement.props.children);
                if (childrenText) {
                    return childrenText;
                }
            }
            // Eğer children yoksa ama başka prop'lar varsa, onları kontrol et
            if (reactElement.props.dangerouslySetInnerHTML) {
                return reactElement.props.dangerouslySetInnerHTML.__html || "";
            }
        }
        return "";
    }
    
    // Eğer obje ise ve toString metodu varsa kullan
    if (typeof element === "object") {
        // React element olmayan objeler için
        if (element.toString && element.toString !== Object.prototype.toString) {
            const str = element.toString();
            if (str !== "[object Object]") {
                return str;
            }
        }
        // Objenin içindeki değerleri kontrol et
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
    
    // Son çare: boş string döndür
    return "";
}

/**
 * i18n.msg() ReactElement döndürür, string'e çevirmek için bu helper kullanılmalı
 * Parametreler de desteklenir: 
 * - i18nToString(i18n, "key", { 0: value }) - Keycloak formatı
 * - i18nToString(i18n, "key", value) - Tek parametre için kısayol
 * 
 * Eğer sonuçta {0}, {1}, {2} gibi placeholder'lar varsa ve realm bilgisi verilmişse,
 * otomatik olarak realm adıyla değiştirilir.
 */
export function i18nToString(
    i18n: I18n, 
    key: Parameters<I18n["msg"]>[0],
    params?: { [key: number]: any } | string | number,
    realmName?: string
): string {
    try {
        // Keycloak'ta parametreli mesajlar obje formatında geçilir: { 0: value }
        // Eğer string veya number geçilirse, { 0: value } formatına çevir
        let paramObj: { [key: number]: any } | undefined = undefined;
        if (params !== undefined) {
            if (typeof params === "object" && !Array.isArray(params) && params !== null) {
                // Zaten obje formatında
                paramObj = params as { [key: number]: any };
            } else {
                // String veya number ise { 0: value } formatına çevir
                paramObj = { 0: params };
            }
        }
        
        // i18n.msg() parametreleri obje formatında alır
        const result = paramObj !== undefined 
            ? (i18n.msg as any)(key, paramObj)
            : (i18n.msg as any)(key);
        
        // Eğer zaten string ise direkt döndür
        if (typeof result === "string") {
            // Eğer key'in kendisi dönüyorsa (çevrilmemişse), boş string döndür
            if (result === String(key)) {
                return "";
            }
            return result;
        }
        
        // ReactElement veya başka bir obje ise, text content'ini çıkar
        const extracted = extractTextFromReactElement(result);
        
        // Eğer hala "[object Object]" veya boş ise, key'in kendisi dönüyorsa boş string döndür
        if (extracted === "[object Object]" || extracted === "" || extracted === String(key)) {
            return "";
        }
        
        // Eğer sonuçta {0} placeholder'ı varsa ve realm adı verilmişse, değiştir
        if (realmName && extracted.includes("{0}")) {
            return extracted.replace("{0}", realmName);
        }
        
        return extracted;
    } catch (error) {
        // Hata durumunda key'i döndür
        console.warn(`i18nToString error for key "${key}":`, error);
        return String(key);
    }
}

