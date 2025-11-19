import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcCard, KcButton, KcForm } from "../components";
import { i18nToString } from "../utils/i18n";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SessionsPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "sessions.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, sessions } = kcContext;

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch {
            return dateString;
        }
    };

    return (
        <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "sessionsTitleHtml" as any) || i18nToString(i18n, "sessionsTitle" as any) || "Sessions"}
                className="w-full max-w-4xl"
            >
                {sessions?.sessions && sessions.sessions.length > 0 ? (
                    <div className="space-y-4">
                        {sessions.sessions.map((session, index) => (
                            <div key={session.id || index} className="space-y-3 p-4 border rounded-lg">
                                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {i18nToString(i18n, "ipAddress" as any) || "IP Address"}:
                                            </span>
                                            <Badge variant="outline">{session.ipAddress}</Badge>
                                        </div>

                                        {session.clients && session.clients.length > 0 && (
                                            <div>
                                                <span className="text-sm font-medium">
                                                    {i18nToString(i18n, "clients") || "Clients"}:
                                                </span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {session.clients.map((client, clientIndex) => (
                                                        <Badge key={clientIndex} variant="secondary">
                                                            {client}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                            {session.started && (
                                                <div>
                                                    <span className="text-muted-foreground">
                                                        {i18nToString(i18n, "started") || "Started"}:
                                                    </span>
                                                    <span className="ml-2">{formatDate(session.started)}</span>
                                                </div>
                                            )}
                                            {session.lastAccess && (
                                                <div>
                                                    <span className="text-muted-foreground">
                                                        {i18nToString(i18n, "lastAccess") || "Last Access"}:
                                                    </span>
                                                    <span className="ml-2">{formatDate(session.lastAccess)}</span>
                                                </div>
                                            )}
                                            {session.expires && (
                                                <div>
                                                    <span className="text-muted-foreground">
                                                        {i18nToString(i18n, "expires") || "Expires"}:
                                                    </span>
                                                    <span className="ml-2">{formatDate(session.expires)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {index < (sessions.sessions?.length || 0) - 1 && (
                                    <Separator className="my-2" />
                                )}
                            </div>
                        ))}

                        {url.sessionsUrl && (
                            <KcForm
                                kcContext={kcContext}
                                action={url.sessionsUrl}
                                method="post"
                                className="mt-6"
                            >
                                <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />
                                <KcButton
                                    kcContext={kcContext}
                                    type="submit"
                                    name="logout"
                                    value="true"
                                    variant="destructive"
                                    className="w-full"
                                >
                                    {i18nToString(i18n, "doLogoutAllSessions" as any) || "Logout All Sessions"}
                                </KcButton>
                            </KcForm>
                        )}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        {i18nToString(i18n, "noActiveSessions" as any) || "No active sessions"}
                    </p>
                )}
            </KcCard>
    );
}
