import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { LogOut } from "lucide-react";

export default function LogoutConfirmPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "logout-confirm.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, message, logoutConfirm, client, realm } = kcContext;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-6" />}

                <div className="flex items-center justify-center mb-6">
                    <LogOut className="h-16 w-16 text-primary" />
                </div>

                <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground">
                        {i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                    </p>
                </div>

                <KcForm
                    kcContext={kcContext}
                    action={url.logoutConfirmAction}
                    method="post"
                    id="kc-logout-confirm-form"
                >
                    {logoutConfirm?.code && (
                        <input
                            type="hidden"
                            name="session_code"
                            value={logoutConfirm.code}
                        />
                    )}

                    <div className="space-y-3">
                        <KcButton
                            kcContext={kcContext}
                            type="submit"
                            className="w-full"
                        >
                            {i18nToString(i18n, "doLogout")}
                        </KcButton>

                        {client?.baseUrl ? (
                            <KcButton
                                kcContext={kcContext}
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    if (client.baseUrl) {
                                        window.location.href = client.baseUrl;
                                    }
                                }}
                            >
                                {i18nToString(i18n, "doCancel")}
                            </KcButton>
                        ) : null}
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}

