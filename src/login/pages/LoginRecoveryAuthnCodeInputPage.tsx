import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcInput, KcButton, KcCard, KcAlert } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import { KeyRound } from "lucide-react";

export default function LoginRecoveryAuthnCodeInputPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-recovery-authn-code-input.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, realm } = kcContext;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-4" />}

                <div className="flex items-center justify-center mb-6">
                    <KeyRound className="h-12 w-12 text-primary" />
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
                    id="kc-recovery-authn-code-input-form"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="recoveryAuthnCode">
                                {i18nToString(i18n, "authenticatorCode")}
                            </Label>
                            <KcInput
                                kcContext={kcContext}
                                id="recoveryAuthnCode"
                                name="recoveryAuthnCode"
                                autoFocus={true}
                                aria-invalid={messagesPerField.existsError("recoveryAuthnCode")}
                                aria-describedby={
                                    messagesPerField.existsError("recoveryAuthnCode")
                                        ? "input-error"
                                        : undefined
                                }
                                className={
                                    messagesPerField.existsError("recoveryAuthnCode")
                                        ? "border-destructive"
                                        : ""
                                }
                            />
                            {messagesPerField.existsError("recoveryAuthnCode") && (
                                <span id="input-error" className="text-sm text-destructive">
                                    {messagesPerField.getFirstError("recoveryAuthnCode")}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <KcButton
                                kcContext={kcContext}
                                type="submit"
                                className="w-full"
                            >
                                {i18nToString(i18n, "doSubmit")}
                            </KcButton>
                        </div>
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}


