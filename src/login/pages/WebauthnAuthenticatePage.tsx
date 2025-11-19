import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Fingerprint } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function WebauthnAuthenticatePage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "webauthn-authenticate.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, authenticators, message, realm } = kcContext;

    const authenticatorList = authenticators?.authenticators ?? [];

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-6" />}

                <div className="flex items-center justify-center mb-6">
                    <Fingerprint className="h-12 w-12 text-primary" />
                </div>

                {authenticatorList.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                            {i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                        </div>

                        {authenticatorList.length > 1 && (
                            <KcForm
                                kcContext={kcContext}
                                action={url.loginAction}
                                method="post"
                                id="kc-webauthn-authenticate-form"
                            >
                                <div className="space-y-3">
                                    {authenticatorList.map((auth, index) => (
                                        <div key={auth.credentialId || index}>
                                            <KcButton
                                                kcContext={kcContext}
                                                type="submit"
                                                name="selectedCredentialId"
                                                value={auth.credentialId}
                                                variant={index === 0 ? "default" : "outline"}
                                                className="w-full justify-start"
                                            >
                                                <Fingerprint className="mr-2 h-4 w-4" />
                                                {auth.label || auth.credentialId}
                                            </KcButton>
                                            {index < authenticatorList.length - 1 && (
                                                <Separator className="my-3" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </KcForm>
                        )}

                        {authenticatorList.length === 1 && (
                            <div className="text-center">
                                <p className="text-sm font-medium mb-2">
                                    {authenticatorList[0].label || authenticatorList[0].credentialId}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </KcCard>
        </div>
    );
}


