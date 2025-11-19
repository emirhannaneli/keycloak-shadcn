import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcCard } from "../components";
import { i18nToString } from "../utils/i18n";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function SamlPostFormPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "saml-post-form.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { samlPost, realm } = kcContext;

    useEffect(() => {
        // Auto-submit form if samlPost exists
        if (samlPost?.url) {
            const form = document.getElementById("saml-post-form") as HTMLFormElement;
            if (form) {
                form.submit();
            }
        }
    }, [samlPost]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">
                        {i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                    </p>
                </div>

                {samlPost?.url && (
                    <form
                        id="saml-post-form"
                        method="post"
                        action={samlPost.url}
                        style={{ display: "none" }}
                    >
                        {samlPost.SAMLRequest && (
                            <input type="hidden" name="SAMLRequest" value={samlPost.SAMLRequest} />
                        )}
                        {samlPost.SAMLResponse && (
                            <input type="hidden" name="SAMLResponse" value={samlPost.SAMLResponse} />
                        )}
                        {samlPost.relayState && (
                            <input type="hidden" name="RelayState" value={samlPost.relayState} />
                        )}
                    </form>
                )}
            </KcCard>
        </div>
    );
}


