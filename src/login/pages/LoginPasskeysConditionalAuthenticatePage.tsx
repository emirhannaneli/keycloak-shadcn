import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Fingerprint } from "lucide-react";

export default function LoginPasskeysConditionalAuthenticatePage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-passkeys-conditional-authenticate.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, message, realm } = kcContext;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-6" />}

                <div className="flex items-center justify-center mb-6">
                    <Fingerprint className="h-12 w-12 text-primary" />
                </div>

                <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground">
                        {i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                    </p>
                </div>

                <KcForm
                    kcContext={kcContext}
                    action={url.loginAction}
                    method="post"
                    id="kc-passkeys-conditional-authenticate-form"
                >
                    <div className="space-y-2">
                        <KcButton
                            kcContext={kcContext}
                            type="submit"
                            className="w-full"
                        >
                            <Fingerprint className="mr-2 h-4 w-4" />
                            {i18nToString(i18n, "doContinue")}
                        </KcButton>
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}

