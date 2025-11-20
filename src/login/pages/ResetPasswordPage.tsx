import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcInput, KcButton, KcCard, KcAlert } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import { useEffect } from "react";

export default function ResetPasswordPage({ kcContext }: { kcContext: Extract<KcContext, { pageId: "login-reset-password.ftl" }> }) {
    const { i18n } = useI18n({ kcContext });

    const {
        url,
        messagesPerField,
        message,
        realm,
    } = kcContext;

    const title = i18nToString(i18n, "doForgotPassword");

    // Document title'ı ayarla
    useEffect(() => {
        const titleText = typeof title === "string" ? title.replace(/<[^>]*>/g, "") : title;
        document.title = titleText || "Forgot Password";
    }, [title]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard kcContext={kcContext} title={title} className="w-full max-w-md">
                    {message && <KcAlert message={message} className="mb-4" />}

                    <KcForm
                        kcContext={kcContext}
                        action={url.loginRestartFlowUrl}
                        method="post"
                        id="kc-reset-password-form"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    {!realm.loginWithEmailAllowed
                                        ? i18nToString(i18n, "username")
                                        : !realm.registrationEmailAsUsername
                                          ? i18nToString(i18n, "usernameOrEmail")
                                          : i18nToString(i18n, "email")}
                                </Label>
                                <KcInput
                                    kcContext={kcContext}
                                    id="username"
                                    name="username"
                                    autoFocus={true}
                                    autoComplete="username"
                                    aria-invalid={messagesPerField.existsError("username")}
                                    aria-describedby={
                                        messagesPerField.existsError("username")
                                            ? "input-error"
                                            : undefined
                                    }
                                    className={
                                        messagesPerField.existsError("username")
                                            ? "border-destructive"
                                            : ""
                                    }
                                />
                                {messagesPerField.existsError("username") && (
                                    <span id="input-error" className="text-sm text-destructive">
                                        {messagesPerField.getFirstError("username")}
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

                    <div className="mt-6 text-center text-sm">
                        <a
                            href={url.loginUrl}
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            {i18nToString(i18n, "backToLogin")}
                        </a>
                    </div>
            </KcCard>
        </div>
    );
}

