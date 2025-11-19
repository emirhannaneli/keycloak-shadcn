import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcInput, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Key } from "lucide-react";

export default function CodePage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "code.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, code, realm } = kcContext;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {code?.error && (
                    <KcAlert
                        message={{
                            type: "error",
                            summary: code.error,
                        }}
                        className="mb-4"
                    />
                )}

                {code?.success && code.code && (
                    <div className="mb-6 rounded-lg bg-muted p-4 text-center">
                        <Key className="mx-auto mb-2 h-8 w-8 text-primary" />
                        <p className="text-2xl font-bold tracking-wider">{code.code}</p>
                    </div>
                )}

                <KcForm
                    kcContext={kcContext}
                    action={url.loginAction}
                    method="post"
                    id="kc-code-form"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <KcInput
                                kcContext={kcContext}
                                id="code"
                                name="code"
                                autoFocus={true}
                                autoComplete="one-time-code"
                                aria-invalid={messagesPerField.existsError("code")}
                                aria-describedby={
                                    messagesPerField.existsError("code") ? "input-error" : undefined
                                }
                                className={
                                    messagesPerField.existsError("code") ? "border-destructive" : ""
                                }
                            />
                            {messagesPerField.existsError("code") && (
                                <span id="input-error" className="text-sm text-destructive">
                                    {messagesPerField.getFirstError("code")}
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

