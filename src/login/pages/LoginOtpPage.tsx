import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcInput, KcButton, KcCard, KcAlert } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function LoginOtpPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-otp.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, otpLogin, realm } = kcContext;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-4" />}

                <KcForm
                    kcContext={kcContext}
                    action={url.loginAction}
                    method="post"
                    id="kc-otp-login-form"
                >
                    <div className="space-y-4">
                        {otpLogin?.userOtpCredentials &&
                            otpLogin.userOtpCredentials.length > 1 && (
                                <div className="space-y-2">
                                    <Select
                                        name="selectedCredentialId"
                                        defaultValue={otpLogin.selectedCredentialId}
                                    >
                                        <SelectTrigger id="otpCredentialId">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {otpLogin.userOtpCredentials.map((credential) => (
                                                <SelectItem
                                                    key={credential.id}
                                                    value={credential.id}
                                                >
                                                    {credential.userLabel}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                        {otpLogin?.userOtpCredentials &&
                            otpLogin.userOtpCredentials.length === 1 && (
                                <input
                                    type="hidden"
                                    name="selectedCredentialId"
                                    value={otpLogin.userOtpCredentials[0].id}
                                />
                            )}

                        <div className="space-y-2">
                            <Label htmlFor="otp">
                                {i18nToString(i18n, "authenticatorCode")}
                            </Label>
                            <KcInput
                                kcContext={kcContext}
                                id="otp"
                                name="otp"
                                type="text"
                                autoFocus={true}
                                autoComplete="one-time-code"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                aria-invalid={messagesPerField.existsError("totp")}
                                aria-describedby={
                                    messagesPerField.existsError("totp")
                                        ? "input-error"
                                        : undefined
                                }
                                className={
                                    messagesPerField.existsError("totp")
                                        ? "border-destructive"
                                        : ""
                                }
                            />
                            {messagesPerField.existsError("totp") && (
                                <span id="input-error" className="text-sm text-destructive">
                                    {messagesPerField.getFirstError("totp")}
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

