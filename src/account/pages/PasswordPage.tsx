import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert, KcInput } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";

export default function PasswordPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "password.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, password } = kcContext;

    return (
        <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "passwordTitleHtml" as any) || i18nToString(i18n, "passwordTitle" as any) || "Password"}
                className="w-full max-w-lg mx-auto"
            >
                {message && <KcAlert message={message} className="mb-4" />}

                <KcForm
                    kcContext={kcContext}
                    action={url.passwordUrl}
                    method="post"
                    id="kc-password-form"
                >
                    <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />

                    <div className="space-y-4">
                        {password?.passwordSet && (
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
                                            ? "password-error"
                                            : undefined
                                    }
                                    className={
                                        messagesPerField.existsError("password")
                                            ? "border-destructive"
                                            : ""
                                    }
                                />
                                {messagesPerField.existsError("password") && (
                                    <span id="password-error" className="text-sm text-destructive">
                                        {messagesPerField.get("password")}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password-new">
                                {i18nToString(i18n, "passwordNew")}
                            </Label>
                            <KcInput
                                kcContext={kcContext}
                                id="password-new"
                                name="password-new"
                                type="password"
                                autoFocus={!password?.passwordSet}
                                autoComplete="new-password"
                                aria-invalid={messagesPerField.existsError("password-new") || messagesPerField.existsError("password-confirm")}
                                aria-describedby={
                                    messagesPerField.existsError("password-new") || messagesPerField.existsError("password-confirm")
                                        ? "password-new-error"
                                        : undefined
                                }
                                className={
                                    messagesPerField.existsError("password-new") || messagesPerField.existsError("password-confirm")
                                        ? "border-destructive"
                                        : ""
                                }
                            />
                            {(messagesPerField.existsError("password-new") || messagesPerField.existsError("password-confirm")) && (
                                <span id="password-new-error" className="text-sm text-destructive">
                                    {messagesPerField.get("password-new") || messagesPerField.get("password-confirm")}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password-confirm">
                                {i18nToString(i18n, "passwordConfirm")}
                            </Label>
                            <KcInput
                                kcContext={kcContext}
                                id="password-confirm"
                                name="password-confirm"
                                type="password"
                                autoComplete="new-password"
                                aria-invalid={messagesPerField.existsError("password-confirm")}
                                aria-describedby={
                                    messagesPerField.existsError("password-confirm")
                                        ? "password-confirm-error"
                                        : undefined
                                }
                                className={
                                    messagesPerField.existsError("password-confirm")
                                        ? "border-destructive"
                                        : ""
                                }
                            />
                            {messagesPerField.existsError("password-confirm") && (
                                <span id="password-confirm-error" className="text-sm text-destructive">
                                    {messagesPerField.get("password-confirm")}
                                </span>
                            )}
                        </div>

                        <div className="mt-6">
                            <KcButton
                                kcContext={kcContext}
                                type="submit"
                                className="w-full"
                            >
                                {i18nToString(i18n, "doSubmit" as any) || "Submit"}
                            </KcButton>
                        </div>
                    </div>
                </KcForm>
            </KcCard>
    );
}
