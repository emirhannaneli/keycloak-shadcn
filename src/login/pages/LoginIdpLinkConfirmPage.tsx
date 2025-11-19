import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Link2 } from "lucide-react";

export default function LoginIdpLinkConfirmPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-idp-link-confirm.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, message, idpAlias, realm } = kcContext;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-6" />}

                <div className="flex items-center justify-center mb-6">
                    <Link2 className="h-16 w-16 text-primary" />
                </div>

                <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground mb-2">
                        {i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                    </p>
                    {idpAlias && (
                        <p className="font-medium text-foreground">{idpAlias}</p>
                    )}
                </div>

                <KcForm
                    kcContext={kcContext}
                    action={url.loginAction}
                    method="post"
                    id="kc-idp-link-confirm-form"
                >
                    <div className="space-y-3">
                        <KcButton
                            kcContext={kcContext}
                            type="submit"
                            name="action"
                            value="linkAccount"
                            className="w-full"
                        >
                            {i18nToString(i18n, "doContinue")}
                        </KcButton>
                        <KcButton
                            kcContext={kcContext}
                            type="submit"
                            name="action"
                            value="cancel"
                            variant="outline"
                            className="w-full"
                        >
                            {i18nToString(i18n, "doCancel")}
                        </KcButton>
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}

