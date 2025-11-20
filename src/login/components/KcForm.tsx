import { type KcContext } from "../KcContext";
import { type ReactNode } from "react";

interface KcFormProps {
    kcContext?: KcContext;
    action?: string;
    method?: "get" | "post";
    children: ReactNode;
    className?: string;
    id?: string;
}

export function KcForm({
    kcContext,
    action,
    method = "post",
    children,
    className,
    id,
}: KcFormProps) {
    // Keycloak'ta login sayfalarında locale değişikliği için form action URL'sine kc_locale ekle
    let finalAction = action;
    if (action && kcContext?.locale?.currentLanguageTag) {
        try {
            const actionUrl = new URL(action, window.location.origin);
            // Eğer URL'de zaten kc_locale yoksa, mevcut locale'i ekle
            if (!actionUrl.searchParams.has("kc_locale")) {
                actionUrl.searchParams.set("kc_locale", kcContext.locale.currentLanguageTag);
                finalAction = actionUrl.toString();
            }
        } catch (e) {
            // URL parse hatası durumunda orijinal action'ı kullan
            console.warn("Failed to parse action URL:", e);
        }
    }
    
    return (
        <form action={finalAction} method={method} id={id} className={className}>
            {children}
        </form>
    );
}

