import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { FileText } from "lucide-react";

export default function LoginX509InfoPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-x509-info.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, message, x509, realm } = kcContext;

    const formData = x509?.formData;
    const isUserEnabled = formData?.isUserEnabled ?? false;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-6" />}

                <div className="flex items-center justify-center mb-6">
                    <FileText className="h-12 w-12 text-primary" />
                </div>

                {formData && (
                    <div className="space-y-4 mb-6">
                        {formData.subjectDN && (
                            <div>
                                <p className="text-sm font-medium mb-1">
                                    {i18nToString(i18n, "username")}
                                </p>
                                <p className="text-sm text-muted-foreground break-all">
                                    {formData.subjectDN}
                                </p>
                            </div>
                        )}
                        {formData.username && (
                            <div>
                                <p className="text-sm font-medium mb-1">
                                    {i18nToString(i18n, "username")}
                                </p>
                                <p className="text-sm text-muted-foreground">{formData.username}</p>
                            </div>
                        )}
                    </div>
                )}

                {isUserEnabled && (
                    <KcForm
                        kcContext={kcContext}
                        action={url.loginAction}
                        method="post"
                        id="kc-x509-info-form"
                    >
                        <div className="space-y-3">
                            <KcButton
                                kcContext={kcContext}
                                type="submit"
                                className="w-full"
                            >
                                {i18nToString(i18n, "doContinue")}
                            </KcButton>
                            <KcButton
                                kcContext={kcContext}
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    window.location.href = url.loginUrl;
                                }}
                            >
                                {i18nToString(i18n, "doCancel")}
                            </KcButton>
                        </div>
                    </KcForm>
                )}
            </KcCard>
        </div>
    );
}


