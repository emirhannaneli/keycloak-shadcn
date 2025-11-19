import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SelectAuthenticatorPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "select-authenticator.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, auth, message, realm } = kcContext;

    const authenticationSelections = auth?.authenticationSelections ?? [];

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-6" />}

                {authenticationSelections.length === 0 ? (
                    <div className="text-center py-8">
                        <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">
                            {i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                        </p>
                    </div>
                ) : (
                    <KcForm
                        kcContext={kcContext}
                        action={url.loginAction}
                        method="post"
                        id="kc-select-authenticator-form"
                    >
                        <div className="space-y-3">
                            {authenticationSelections.map((selection, index) => (
                                <div key={selection.authExecId}>
                                    <KcButton
                                        kcContext={kcContext}
                                        type="submit"
                                        name="authExecId"
                                        value={selection.authExecId}
                                        variant={index === 0 ? "default" : "outline"}
                                        className="w-full justify-start"
                                    >
                                        <Shield className="mr-2 h-4 w-4" />
                                        {selection.displayName}
                                    </KcButton>
                                    {selection.helpText && (
                                        <p className="mt-1 text-xs text-muted-foreground pl-6">
                                            {selection.helpText}
                                        </p>
                                    )}
                                    {index < authenticationSelections.length - 1 && (
                                        <Separator className="my-3" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </KcForm>
                )}
            </KcCard>
        </div>
    );
}


