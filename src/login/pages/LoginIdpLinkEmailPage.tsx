import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcInput, KcButton, KcCard, KcAlert } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import { Mail, Link2 } from "lucide-react";

export default function LoginIdpLinkEmailPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-idp-link-email.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, idpAlias, brokerContext } = kcContext;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "emailLinkIdpTitle", undefined, idpAlias || "")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-4" />}

                <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                        <Link2 className="h-12 w-12 text-primary" />
                        <Mail className="absolute -bottom-1 -right-1 h-6 w-6 text-primary" />
                    </div>
                </div>

                <div className="text-center mb-6">
                    {idpAlias && (
                        <p className="text-sm text-muted-foreground mb-2">
                            {i18nToString(i18n, "emailLinkIdp", undefined, idpAlias)}
                        </p>
                    )}
                    {brokerContext?.username && (
                        <p className="text-sm text-muted-foreground mb-1">
                            {i18nToString(i18n, "username")}: {brokerContext.username}
                        </p>
                    )}
                </div>

                <KcForm
                    kcContext={kcContext}
                    action={url.loginAction}
                    method="post"
                    id="kc-idp-link-email-form"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{i18nToString(i18n, "email")}</Label>
                            <KcInput
                                kcContext={kcContext}
                                id="email"
                                name="email"
                                type="email"
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

