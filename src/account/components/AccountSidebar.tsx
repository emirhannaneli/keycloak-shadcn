import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { i18nToString } from "../utils/i18n";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
        <nav className="flex flex-row items-center gap-2 overflow-x-auto py-2 pl-1 pr-1 scrollbar-hide">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageId === item.id;
                
                return (
                    <a
                        key={item.id}
                        href={item.href}
                        onClick={onItemClick}
                        className="inline-block"
                    >
                        <Badge
                            variant={isActive ? "default" : "outline"}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap w-auto backdrop-blur-md rounded-lg",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-xl border-0 ring-2 ring-primary/50 dark:ring-primary/40 scale-105 brightness-110"
                                    : "bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 text-foreground hover:bg-white/20 dark:hover:bg-black/20 hover:border-white/30 dark:hover:border-white/15 hover:shadow-lg"
                            )}
                        >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="hidden sm:inline">{item.label}</span>
                        </Badge>
                    </a>
                );
            })}
        </nav>
    );
}

