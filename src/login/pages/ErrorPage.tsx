import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcCard, KcButton, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Home } from "lucide-react";

export default function ErrorPage({ kcContext }: { kcContext: Extract<KcContext, { pageId: "error.ftl" }> }) {
    const { i18n } = useI18n({ kcContext });

    const { message, client } = kcContext;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "errorTitle")}
                className="w-full max-w-md"
            >
                {message && (
                    <KcAlert
                        message={{
                            type: "error",
                            summary: message.summary,
                        }}
                        className="mb-6"
                    />
                )}

                {client?.baseUrl && (
                    <div className="mt-6">
                        <KcButton
                            kcContext={kcContext}
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                if (client.baseUrl) {
                                    window.location.href = client.baseUrl;
                                }
                            }}
                        >
                            <Home className="mr-2 h-4 w-4" />
                            {i18nToString(i18n, "backToApplication")}
                        </KcButton>
                    </div>
                )}
            </KcCard>
        </div>
    );
}

