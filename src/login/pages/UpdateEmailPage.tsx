import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcInput, KcButton, KcCard, KcAlert } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import { Mail } from "lucide-react";
import { useEffect } from "react";

export default function UpdateEmailPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "update-email.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, isAppInitiatedAction, profile, realm } = kcContext;
    
    const email = profile?.attributesByName?.email;

    const title = i18nToString(i18n, "updateEmailTitle") || i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "");

    // Document title'ı ayarla
    useEffect(() => {
        const titleText = typeof title === "string" ? title.replace(/<[^>]*>/g, "") : title;
        document.title = titleText || "Update Email";
    }, [title]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={title}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-4" />}

                <div className="flex items-center justify-center mb-6">
                    <Mail className="h-12 w-12 text-primary" />
                </div>

                <KcForm
                    kcContext={kcContext}
                    action={url.loginAction}
                    method="post"
                    id="kc-update-email-form"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{i18nToString(i18n, "email")}</Label>
                            <KcInput
                                kcContext={kcContext}
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={email?.value ?? ""}
                                autoFocus={true}
                                autoComplete="email"
                                aria-invalid={messagesPerField.existsError("email")}
                                aria-describedby={
                                    messagesPerField.existsError("email") ? "input-error" : undefined
                                }
                                className={
                                    messagesPerField.existsError("email") ? "border-destructive" : ""
                                }
                            />
                            {messagesPerField.existsError("email") && (
                                <span id="input-error" className="text-sm text-destructive">
                                    {messagesPerField.getFirstError("email")}
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


