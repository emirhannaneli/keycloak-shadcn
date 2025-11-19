import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcCard } from "../components";
import { i18nToString } from "../utils/i18n";
import { LogOut, Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function FrontchannelLogoutPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "frontchannel-logout.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { logout, realm } = kcContext;

    useEffect(() => {
        if (logout?.clients) {
            // Auto-redirect to logout URLs
            logout.clients.forEach((client) => {
                if (client.frontChannelLogoutUrl) {
                    const iframe = document.createElement("iframe");
                    iframe.style.display = "none";
                    iframe.src = client.frontChannelLogoutUrl;
                    document.body.appendChild(iframe);
                }
            });
        }
    }, [logout]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                <div className="flex flex-col items-center justify-center py-8">
                    <LogOut className="h-12 w-12 text-primary mb-4" />
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground text-center">
                        {i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                    </p>
                </div>
            </KcCard>
        </div>
    );
}

