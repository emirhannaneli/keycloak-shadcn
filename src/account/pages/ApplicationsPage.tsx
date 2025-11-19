import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcCard, KcButton } from "../components";
import { i18nToString } from "../utils/i18n";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ApplicationsPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "applications.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { applications } = kcContext;

    return (
        <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "applicationsTitleHtml" as any) || i18nToString(i18n, "applicationsTitle" as any) || "Applications"}
                className="w-full max-w-4xl"
            >
                {applications?.applications && applications.applications.length > 0 ? (
                    <div className="space-y-6">
                        {applications.applications.map((app, index) => (
                            <div key={index} className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {app.client?.name || app.client?.clientId || ""}
                                        </h3>
                                        {app.client?.clientId && (
                                            <p className="text-sm text-muted-foreground">
                                                {app.client.clientId}
                                            </p>
                                        )}
                                    </div>
                                    {app.effectiveUrl && (
                                        <KcButton
                                            kcContext={kcContext}
                                            type="button"
                                            variant="outline"
                                            className="w-full sm:w-auto"
                                            onClick={() => {
                                                window.location.href = app.effectiveUrl!;
                                            }}
                                        >
                                            {i18nToString(i18n, "openApplication" as any) || "Open Application"}
                                        </KcButton>
                                    )}
                                </div>

                                {(app.realmRolesAvailable?.length > 0 ||
                                    Object.keys(app.resourceRolesAvailable || {}).length > 0 ||
                                    app.additionalGrants?.length > 0 ||
                                    app.clientScopesGranted?.length > 0) && (
                                    <div className="space-y-3">
                                        {app.realmRolesAvailable && app.realmRolesAvailable.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium mb-2">
                                                    {i18nToString(i18n, "realmRoles" as any) || "Realm Roles"}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {app.realmRolesAvailable.map((role, roleIndex) => (
                                                        <Badge key={roleIndex} variant="secondary">
                                                            {role.name}
                                                            {role.description && (
                                                                <span className="ml-1 text-xs opacity-70">
                                                                    ({role.description})
                                                                </span>
                                                            )}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {app.resourceRolesAvailable &&
                                            Object.keys(app.resourceRolesAvailable).length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">
                                                        {i18nToString(i18n, "resourceRoles" as any) || "Resource Roles"}
                                                    </h4>
                                                    {Object.entries(app.resourceRolesAvailable).map(
                                                        ([resource, roles]) => (
                                                            <div key={resource} className="mb-2">
                                                                <p className="text-xs text-muted-foreground mb-1">
                                                                    {resource}:
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {roles.map((role, roleIndex) => (
                                                                        <Badge key={roleIndex} variant="outline">
                                                                            {role.roleName}
                                                                            {role.roleDescription && (
                                                                                <span className="ml-1 text-xs opacity-70">
                                                                                    ({role.roleDescription})
                                                                                </span>
                                                                            )}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                        {app.additionalGrants && app.additionalGrants.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium mb-2">
                                                    {i18nToString(i18n, "additionalGrants") || "Additional Grants"}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {app.additionalGrants.map((grant, grantIndex) => (
                                                        <Badge key={grantIndex} variant="secondary">
                                                            {grant}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {app.clientScopesGranted && app.clientScopesGranted.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium mb-2">
                                                    {i18nToString(i18n, "clientScopesGranted" as any) || "Client Scopes Granted"}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {app.clientScopesGranted.map((scope, scopeIndex) => (
                                                        <Badge key={scopeIndex} variant="outline">
                                                            {scope}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {index < (applications.applications?.length || 0) - 1 && (
                                    <Separator className="my-4" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        {i18nToString(i18n, "noApplications" as any) || "No applications"}
                    </p>
                )}
            </KcCard>
    );
}
