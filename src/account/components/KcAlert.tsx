import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { type KcContext } from "../KcContext";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { useI18n } from "../i18n";
import { i18nToString } from "../utils/i18n";

interface KcAlertProps {
    kcContext?: KcContext;
    message?: {
        type: "error" | "warning" | "success" | "info";
        summary: string;
    };
    className?: string;
}

export function KcAlert({ kcContext, message, className }: KcAlertProps) {
    if (!message) return null;

    // realm undefined olabilir, bu yüzden güvenli bir şekilde kontrol ediyoruz
    // Mevcut realm objesini koruyarak sadece eksik özelliği ekliyoruz
    const safeKcContext = kcContext ? {
        ...kcContext,
        realm: kcContext.realm ? {
            ...kcContext.realm,
            internationalizationEnabled: kcContext.realm.internationalizationEnabled ?? false
        } : {
            userManagedAccessAllowed: true,
            internationalizationEnabled: false
        }
    } : undefined;

    const { i18n } = safeKcContext ? useI18n({ kcContext: safeKcContext as any }) : { i18n: null };

    const variant = message.type === "error" ? "destructive" : "default";

    const iconMap = {
        error: AlertCircle,
        warning: AlertTriangle,
        success: CheckCircle2,
        info: Info,
    };

    const Icon = iconMap[message.type] || Info;

    // i18n çevirileri
    const titleMap: Record<string, string> = {
        error: i18n ? i18nToString(i18n, "alert.error" as any) || "Error" : "Error",
        warning: i18n ? i18nToString(i18n, "alert.warning" as any) || "Warning" : "Warning",
        success: i18n ? i18nToString(i18n, "alert.success" as any) || "Success" : "Success",
        info: i18n ? i18nToString(i18n, "alert.info" as any) || "Info" : "Info",
    };

    const title = titleMap[message.type] || "Info";

    return (
        <Alert variant={variant} className={className}>
            <Icon className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription
                dangerouslySetInnerHTML={{ __html: message.summary }}
            />
        </Alert>
    );
}

