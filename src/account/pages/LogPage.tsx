import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcCard } from "../components";
import { i18nToString } from "../utils/i18n";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function LogPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "log.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { log } = kcContext;

    const formatDate = (dateValue: string | number | Date) => {
        try {
            const date = new Date(dateValue);
            return date.toLocaleString();
        } catch {
            return String(dateValue);
        }
    };

    // Güvenli kontrol - log undefined veya events yoksa boş durumu göster
    if (!log || !log.events || log.events.length === 0) {
        return (
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "accountLogTitleHtml" as any) || i18nToString(i18n, "accountLogTitle" as any) || "Account Log"}
                className="w-full max-w-4xl"
            >
                <p className="text-muted-foreground text-center py-8">
                    {i18nToString(i18n, "noLogEvents" as any) || "No log events"}
                </p>
            </KcCard>
        );
    }

    return (
        <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "accountLogTitleHtml" as any) || i18nToString(i18n, "accountLogTitle" as any) || "Account Log"}
                className="w-full max-w-4xl"
            >
                {log.events.length > 0 ? (
                    <div className="space-y-4">
                        {log.events.map((event, index) => (
                            <div key={index} className="space-y-3 p-4 border rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{event.event}</Badge>
                                            {event.client && (
                                                <span className="text-sm text-muted-foreground">
                                                    {event.client}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                            {event.date && (
                                                <div>
                                                    <span className="text-muted-foreground">
                                                        {i18nToString(i18n, "date") || "Date"}:
                                                    </span>
                                                    <span className="ml-2">{formatDate(event.date)}</span>
                                                </div>
                                            )}
                                            {event.ipAddress && (
                                                <div>
                                                    <span className="text-muted-foreground">
                                                        {i18nToString(i18n, "ipAddress" as any) || "IP Address"}:
                                                    </span>
                                                    <Badge variant="secondary" className="ml-2">
                                                        {event.ipAddress}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>

                                        {event.details && event.details.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                <span className="text-sm font-medium">
                                                    {i18nToString(i18n, "details") || "Details"}:
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {event.details.map((detail, detailIndex) => (
                                                        <div
                                                            key={detailIndex}
                                                            className="text-xs bg-muted px-2 py-1 rounded"
                                                        >
                                                            <span className="font-medium">{detail.key}:</span>{" "}
                                                            <span>{detail.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {index < (log.events?.length || 0) - 1 && (
                                    <Separator className="my-2" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        {i18nToString(i18n, "noLogEvents" as any) || "No log events"}
                    </p>
                )}
            </KcCard>
    );
}
