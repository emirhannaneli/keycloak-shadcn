import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Fingerprint } from "lucide-react";
import { useEffect } from "react";

export default function WebauthnRegisterPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "webauthn-register.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, message, isAppInitiatedAction } = kcContext;

    const title = i18nToString(i18n, "doRegisterSecurityKey");

    // Document title'ı ayarla
    useEffect(() => {
        const titleText = typeof title === "string" ? title.replace(/<[^>]*>/g, "") : title;
        document.title = titleText || "Register Security Key";
    }, [title]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={title}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-6" />}

                <div className="flex items-center justify-center mb-6">
                    <Fingerprint className="h-12 w-12 text-primary" />
                </div>

                <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground">
                        {i18nToString(i18n, "doRegisterSecurityKey")}
                    </p>
                </div>

                <KcForm
                    kcContext={kcContext}
                    action={url.loginAction}
                    method="post"
                    id="kc-webauthn-register-form"
                >
                    <div className="space-y-3">
                        <KcButton
                            kcContext={kcContext}
                            type="submit"
                            className="w-full"
                        >
                            <Fingerprint className="mr-2 h-4 w-4" />
                            {i18nToString(i18n, "doRegisterSecurityKey")}
                        </KcButton>
                        {isAppInitiatedAction && (
                            <KcButton
                                kcContext={kcContext}
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    window.location.href = url.loginUrl;
                                }}
                            >
                                {i18nToString(i18n, "doCancel")}
                            </KcButton>
                        )}
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}


