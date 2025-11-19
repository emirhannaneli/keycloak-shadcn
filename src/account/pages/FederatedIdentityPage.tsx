import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcCard, KcButton, KcForm, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Badge } from "@/components/ui/badge";

export default function FederatedIdentityPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "federatedIdentity.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, message, federatedIdentity } = kcContext;

    return (
        <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "federatedIdentityTitleHtml" as any) || i18nToString(i18n, "federatedIdentityTitle" as any) || "Federated Identity"}
                className="w-full max-w-3xl"
            >
                {message && <KcAlert message={message} className="mb-4" />}

                {federatedIdentity?.identities && federatedIdentity.identities.length > 0 ? (
                    <div className="space-y-4">
                        {federatedIdentity.identities.map((identity, index) => (
                            <div
                                key={identity.providerId || index}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg"
                            >
                                <div className="flex-1 w-full sm:w-auto">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="font-semibold">{identity.displayName}</h3>
                                        {identity.connected ? (
                                            <Badge variant="default">
                                                {i18nToString(i18n, "connected" as any) || "Connected"}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                {i18nToString(i18n, "notConnected" as any) || "Not Connected"}
                                            </Badge>
                                        )}
                                    </div>
                                    {identity.userName && (
                                        <p className="text-sm text-muted-foreground">
                                            {identity.userName}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 w-full sm:w-auto">
                                    {identity.connected ? (
                                        federatedIdentity.removeLinkPossible && (
                                            <KcForm
                                                kcContext={kcContext}
                                                action={url.socialUrl}
                                                method="post"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="stateChecker"
                                                    value={kcContext.stateChecker}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="action"
                                                    value="remove"
                                                />
                                                <input
                                                    type="hidden"
                                                    name="providerId"
                                                    value={identity.providerId}
                                                />
                                                <KcButton
                                                    kcContext={kcContext}
                                                    type="submit"
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    {i18nToString(i18n, "doRemove") || "Remove"}
                                                </KcButton>
                                            </KcForm>
                                        )
                                    ) : (
                                        <KcButton
                                            kcContext={kcContext}
                                            type="button"
                                            variant="default"
                                            size="sm"
                                            onClick={() => {
                                                window.location.href = `${url.socialUrl}?providerId=${identity.providerId}`;
                                            }}
                                        >
                                            {i18nToString(i18n, "doAdd") || "Add"}
                                        </KcButton>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        {i18nToString(i18n, "noFederatedIdentity" as any) || "No federated identities"}
                    </p>
                )}
            </KcCard>
    );
}
