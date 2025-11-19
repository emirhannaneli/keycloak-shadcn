import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Clock } from "lucide-react";

export default function LoginPageExpiredPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-page-expired.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, message } = kcContext;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "errorTitle")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-6" />}

                <div className="flex items-center justify-center mb-6">
                    <Clock className="h-16 w-16 text-muted-foreground" />
                </div>

                <div className="text-center mb-6">
                </div>

                <div className="space-y-3">
                    {url.loginRestartFlowUrl && (
                        <KcForm
                            kcContext={kcContext}
                            action={url.loginRestartFlowUrl}
                            method="post"
                        >
                            <KcButton
                                kcContext={kcContext}
                                type="submit"
                                className="w-full"
                            >
                                {i18nToString(i18n, "doContinue")}
                            </KcButton>
                        </KcForm>
                    )}

                    {url.loginAction && (
                        <KcForm
                            kcContext={kcContext}
                            action={url.loginAction}
                            method="post"
                        >
                            <KcButton
                                kcContext={kcContext}
                                type="submit"
                                variant="outline"
                                className="w-full"
                            >
                                {i18nToString(i18n, "doContinue")}
                            </KcButton>
                        </KcForm>
                    )}
                </div>
            </KcCard>
        </div>
    );
}


