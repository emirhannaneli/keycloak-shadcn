import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcCard, KcButton, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { ArrowRight } from "lucide-react";

export default function InfoPage({ kcContext }: { kcContext: Extract<KcContext, { pageId: "info.ftl" }> }) {
    const { i18n } = useI18n({ kcContext });

    const { message, messageHeader, actionUri, requiredActions, realm } = kcContext;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={messageHeader ? String(messageHeader) : i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {message && (
                    <KcAlert
                        message={{
                            type: message.type || "info",
                            summary: message.summary,
                        }}
                        className="mb-6"
                    />
                )}

                {requiredActions && requiredActions.length > 0 && (
                    <div className="mb-6 space-y-2">
                        <p className="text-sm font-medium">{i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}:</p>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {requiredActions.map((action, index) => (
                                <li key={index}>{action}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {actionUri && (
                    <div className="mt-6">
                        <KcButton
                            kcContext={kcContext}
                            className="w-full"
                            onClick={() => {
                                window.location.href = actionUri;
                            }}
                        >
                                {i18nToString(i18n, "doContinue")}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </KcButton>
                    </div>
                )}
            </KcCard>
        </div>
    );
}

