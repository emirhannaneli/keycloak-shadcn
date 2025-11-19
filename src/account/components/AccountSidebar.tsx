import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { i18nToString } from "../utils/i18n";
import { cn } from "@/lib/utils";
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
    const { i18n } = useI18n({ kcContext });
    const { url } = kcContext;

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
        {
            id: "totp.ftl",
            label: i18nToString(i18n, "authenticatorTitleHtml" as any) || i18nToString(i18n, "authenticatorTitle" as any) || "Authenticator",
            icon: Shield,
            href: url.totpUrl,
        },
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
        {
            id: "log.ftl",
            label: i18nToString(i18n, "accountLogTitleHtml" as any) || i18nToString(i18n, "accountLogTitle" as any) || "Log",
            icon: FileText,
            href: url.logUrl,
        },
    ];

    return (
        <nav className="space-y-1 flex flex-col justify-center h-full">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageId === item.id;
                
                return (
                    <a
                        key={item.id}
                        href={item.href}
                        onClick={onItemClick}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {isActive && (
                            <span className="ml-auto">→</span>
                        )}
                    </a>
                );
            })}
        </nav>
    );
}

