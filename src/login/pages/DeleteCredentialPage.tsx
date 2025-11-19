import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Key, AlertTriangle } from "lucide-react";

export default function DeleteCredentialPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "delete-credential.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, message, credentialLabel } = kcContext;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "errorTitle")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-6" />}

                <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                        <Key className="h-16 w-16 text-destructive" />
                        <AlertTriangle className="absolute -top-1 -right-1 h-6 w-6 text-destructive fill-destructive" />
                    </div>
                </div>

                <div className="text-center mb-6">
                    {credentialLabel && (
                        <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">{credentialLabel}</span>
                        </p>
                    )}
                </div>

                <KcForm
                    kcContext={kcContext}
                    action={url.loginAction}
                    method="post"
                    id="kc-delete-credential-form"
                >
                    <div className="space-y-3">
                        <KcButton
                            kcContext={kcContext}
                            type="submit"
                            name="submitAction"
                            value="Delete"
                            variant="destructive"
                            className="w-full"
                        >
                            <Key className="mr-2 h-4 w-4" />
                            {i18nToString(i18n, "doYes")}
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
            </KcCard>
        </div>
    );
}

