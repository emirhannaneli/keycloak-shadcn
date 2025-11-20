import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcInput, KcButton, KcCard, KcAlert } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import { useEffect } from "react";

export default function LoginUpdatePasswordPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-update-password.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, isAppInitiatedAction, realm } = kcContext;

    const realmName = realm?.displayName || realm?.name || "";
    const title = i18nToString(i18n, "updatePasswordTitle") || i18nToString(i18n, "loginTitle", undefined, realmName);

    // Document title'ı ayarla
    useEffect(() => {
        const titleText = typeof title === "string" ? title.replace(/<[^>]*>/g, "") : title;
        document.title = titleText || "Update Password";
    }, [title]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={title}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-4" />}

                <KcForm
                    kcContext={kcContext}
                    action={url.loginAction}
                    method="post"
                    id="kc-passwd-update-form"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password-new">
                                {i18nToString(i18n, "passwordNew")}
                            </Label>
                            <KcInput
                                kcContext={kcContext}
                                id="password-new"
                                name="password-new"
                                type="password"
                                autoFocus={true}
                                autoComplete="new-password"
                                aria-invalid={messagesPerField.existsError("password", "password-confirm")}
                                aria-describedby={
                                    messagesPerField.existsError("password", "password-confirm")
                                        ? "input-error"
                                        : undefined
                                }
                                className={
                                    messagesPerField.existsError("password", "password-confirm")
                                        ? "border-destructive"
                                        : ""
                                }
                            />
                            {messagesPerField.existsError("password", "password-confirm") && (
                                <span id="input-error" className="text-sm text-destructive">
                                    {messagesPerField.getFirstError("password", "password-confirm")}
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
                                        ? "input-error-confirm"
                                        : undefined
                                }
                                className={
                                    messagesPerField.existsError("password-confirm")
                                        ? "border-destructive"
                                        : ""
                                }
                            />
                            {messagesPerField.existsError("password-confirm") && (
                                <span id="input-error-confirm" className="text-sm text-destructive">
                                    {messagesPerField.getFirstError("password-confirm")}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <KcButton
                                kcContext={kcContext}
                                type="submit"
                                className="flex-1"
                            >
                                {i18nToString(i18n, "doSubmit")}
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
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}

