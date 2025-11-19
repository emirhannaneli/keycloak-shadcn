import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcInput, KcButton, KcCard, KcAlert } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";

export default function LoginPasswordPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-password.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, realm, messagesPerField, message, auth } = kcContext;

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
                    id="kc-form-login"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                {i18nToString(i18n, "password")}
                            </Label>
                            <KcInput
                                kcContext={kcContext}
                                id="password"
                                name="password"
                                type="password"
                                autoFocus={true}
                                autoComplete="current-password"
                                aria-invalid={messagesPerField.existsError("password")}
                                aria-describedby={
                                    messagesPerField.existsError("password")
                                        ? "input-error"
                                        : undefined
                                }
                                className={
                                    messagesPerField.existsError("password")
                                        ? "border-destructive"
                                        : ""
                                }
                            />
                            {messagesPerField.existsError("password") && (
                                <span id="input-error" className="text-sm text-destructive">
                                    {messagesPerField.getFirstError("password")}
                                </span>
                            )}
                        </div>

                        {realm.resetPasswordAllowed && (
                            <div className="text-right">
                                <a
                                    href={url.loginResetCredentialsUrl}
                                    className="text-sm text-primary underline-offset-4 hover:underline"
                                >
                                    {i18nToString(i18n, "doForgotPassword")}
                                </a>
                            </div>
                        )}

                        {(auth as any)?.selectedCredential && (
                            <input
                                type="hidden"
                                id="id-hidden-input"
                                name="credentialId"
                                value={(auth as any).selectedCredential}
                            />
                        )}

                        <div className="space-y-2">
                            <KcButton
                                kcContext={kcContext}
                                name="login"
                                id="kc-login"
                                type="submit"
                                className="w-full"
                            >
                                {i18nToString(i18n, "doLogIn")}
                            </KcButton>
                        </div>
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}

