import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcInput, KcButton, KcCard, KcAlert } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import { Smartphone } from "lucide-react";

export default function LoginOauth2DeviceVerifyUserCodePage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-oauth2-device-verify-user-code.ftl" }>;
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
                    <Smartphone className="h-12 w-12 text-primary" />
                </div>

                <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground">
                        {i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                    </p>
                </div>

                <KcForm
                    kcContext={kcContext}
                    action={url.oauth2DeviceVerificationAction}
                    method="post"
                    id="kc-oauth2-device-verify-user-code-form"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="userCode">
                                {i18nToString(i18n, "authenticatorCode")}
                            </Label>
                            <KcInput
                                kcContext={kcContext}
                                id="userCode"
                                name="userCode"
                                autoFocus={true}
                                autoComplete="one-time-code"
                                aria-invalid={messagesPerField.existsError("userCode")}
                                aria-describedby={
                                    messagesPerField.existsError("userCode") ? "input-error" : undefined
                                }
                                className={
                                    messagesPerField.existsError("userCode") ? "border-destructive" : ""
                                }
                            />
                            {messagesPerField.existsError("userCode") && (
                                <span id="input-error" className="text-sm text-destructive">
                                    {messagesPerField.getFirstError("userCode")}
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

