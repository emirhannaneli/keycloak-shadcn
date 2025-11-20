import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { i18nToString } from "../utils/i18n";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
    User, 
    Lock, 
    Shield, 
    Link2, 
    Monitor, 
    Grid,
    FileText
} from "lucide-react";

interface AccountSidebarProps {
    kcContext: KcContext;
    currentPageId: string;
    onItemClick?: () => void;
}

export function AccountSidebar({ kcContext, currentPageId, onItemClick }: AccountSidebarProps) {
    // realm undefined olabilir, bu yüzden güvenli bir şekilde kontrol ediyoruz
    // Mevcut realm objesini koruyarak sadece eksik özelliği ekliyoruz
    const safeKcContext = {
        ...kcContext,
        realm: kcContext.realm ? {
            ...kcContext.realm,
            internationalizationEnabled: kcContext.realm.internationalizationEnabled ?? false
        } : {
            userManagedAccessAllowed: true,
            internationalizationEnabled: false
        }
    };
    
    const { i18n } = useI18n({ kcContext: safeKcContext as any });
    const { url } = kcContext;

    // Totp ve Log özelliklerinin açık olup olmadığını kontrol et
    // url.totpUrl varsa TOTP menü öğesini göster (totp objesi olmasa bile sayfa açılabilir)
    const isTotpEnabled = url.totpUrl !== undefined;
    const isLogEnabled = url.logUrl !== undefined;

    const menuItems = [
        {
            id: "account.ftl",
            label: i18nToString(i18n, "accountTitleHtml" as any) || i18nToString(i18n, "accountTitle" as any) || "Account",
            icon: User,
            href: url.accountUrl,
        },
        {
            id: "password.ftl",
            label: i18nToString(i18n, "passwordTitleHtml" as any) || i18nToString(i18n, "passwordTitle" as any) || "Password",
            icon: Lock,
            href: url.passwordUrl,
        },
        // Totp özelliği açıksa göster
        ...(isTotpEnabled ? [{
            id: "totp.ftl",
            label: i18nToString(i18n, "authenticatorTitleHtml" as any) || i18nToString(i18n, "authenticatorTitle" as any) || "Authenticator",
            icon: Shield,
            href: url.totpUrl,
        }] : []),
        {
            id: "federatedIdentity.ftl",
            label: i18nToString(i18n, "federatedIdentityTitleHtml" as any) || i18nToString(i18n, "federatedIdentityTitle" as any) || "Federated Identity",
            icon: Link2,
            href: url.socialUrl,
        },
        {
            id: "sessions.ftl",
            label: i18nToString(i18n, "sessionsTitleHtml" as any) || i18nToString(i18n, "sessionsTitle" as any) || "Sessions",
            icon: Monitor,
            href: url.sessionsUrl,
        },
        {
            id: "applications.ftl",
            label: i18nToString(i18n, "applicationsTitleHtml" as any) || i18nToString(i18n, "applicationsTitle" as any) || "Applications",
            icon: Grid,
            href: url.applicationsUrl,
        },
        // Log özelliği açıksa göster
        ...(isLogEnabled ? [{
            id: "log.ftl",
            label: i18nToString(i18n, "accountLogTitleHtml" as any) || i18nToString(i18n, "accountLogTitle" as any) || "Log",
            icon: FileText,
            href: url.logUrl,
        }] : []),
    ];

    return (
        <div className="inline-block">
            <TooltipProvider>
                <nav className="inline-flex flex-row flex-wrap items-center justify-center gap-2 py-2 px-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPageId === item.id;
                    
                    return (
                        <Tooltip key={item.id}>
                            <TooltipTrigger asChild>
                                <a
                                    href={item.href}
                                    onClick={onItemClick}
                                    className="inline-block"
                                >
                                    <Badge
                                        variant={isActive ? "default" : "outline"}
                                        className={cn(
                                            "flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 transition-all cursor-pointer backdrop-blur-md rounded-lg",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-xl border-0 ring-2 ring-primary/50 dark:ring-primary/40 scale-105 brightness-110"
                                                : "bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 text-foreground hover:bg-white/20 dark:hover:bg-black/20 hover:border-white/30 dark:hover:border-white/15 hover:shadow-lg"
                                        )}
                                    >
                                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                    </Badge>
                                </a>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{item.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
                </nav>
            </TooltipProvider>
        </div>
    );
}

