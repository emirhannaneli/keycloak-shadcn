import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Shield, CheckCircle2, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function LoginOauthGrantPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-oauth-grant.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, message, oauth, client, realm } = kcContext;

    const clientScopesRequested = oauth?.clientScopesRequested ?? [];

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-6" />}

                {client?.name && (
                    <div className="text-center mb-6">
                        <Shield className="mx-auto h-12 w-12 text-primary mb-3" />
                        <h3 className="text-lg font-semibold">{client.name}</h3>
                        {client.clientId && (
                            <p className="text-xs text-muted-foreground mt-1">{client.clientId}</p>
                        )}
                    </div>
                )}

                {clientScopesRequested.length > 0 && (
                    <div className="mb-6">
                        <p className="text-sm font-medium mb-3">
                            {i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                        </p>
                        <div className="space-y-2">
                            {clientScopesRequested.map((scope, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-foreground">
                                        {scope.consentScreenText || scope.dynamicScopeParameter}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(client?.attributes?.policyUri || client?.attributes?.tosUri) && (
                    <>
                        <Separator className="my-4" />
                        <div className="text-xs text-muted-foreground space-y-1">
                            {client.attributes.policyUri && (
                                <p>
                                    <a
                                        href={client.attributes.policyUri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary underline-offset-4 hover:underline"
                                    >
                                        Privacy Policy
                                    </a>
                                </p>
                            )}
                            {client.attributes.tosUri && (
                                <p>
                                    <a
                                        href={client.attributes.tosUri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary underline-offset-4 hover:underline"
                                    >
                                        Terms of Service
                                    </a>
                                </p>
                            )}
                        </div>
                    </>
                )}

                <KcForm
                    kcContext={kcContext}
                    action={url.oauthAction}
                    method="post"
                    id="kc-oauth-grant-form"
                >
                    <div className="mt-6 space-y-3">
                        <KcButton
                            kcContext={kcContext}
                            type="submit"
                            name="accept"
                            value="true"
                            className="w-full"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {i18nToString(i18n, "doAccept")}
                        </KcButton>
                        <KcButton
                            kcContext={kcContext}
                            type="submit"
                            name="accept"
                            value="false"
                            variant="outline"
                            className="w-full"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            {i18nToString(i18n, "doCancel")}
                        </KcButton>
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}

