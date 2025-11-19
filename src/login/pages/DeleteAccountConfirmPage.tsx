import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Trash2, AlertTriangle } from "lucide-react";

export default function DeleteAccountConfirmPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "delete-account-confirm.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, message, triggered_from_aia } = kcContext;

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
                        <Trash2 className="h-16 w-16 text-destructive" />
                        <AlertTriangle className="absolute -top-1 -right-1 h-6 w-6 text-destructive fill-destructive" />
                    </div>
                </div>

                <div className="text-center mb-6">
                </div>

                <KcForm
                    kcContext={kcContext}
                    action={url.loginAction}
                    method="post"
                    id="kc-delete-account-confirm-form"
                >
                    <div className="space-y-3">
                        <KcButton
                            kcContext={kcContext}
                            type="submit"
                            name="submitAction"
                            value="Delete Account"
                            variant="destructive"
                            className="w-full"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {i18nToString(i18n, "doYes")}
                        </KcButton>
                        {triggered_from_aia && (
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
                        )}
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}

