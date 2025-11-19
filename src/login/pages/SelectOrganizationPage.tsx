import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SelectOrganizationPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "select-organization.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, message, user, realm } = kcContext;

    const orgList = user?.organizations ?? [];

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-6" />}

                {orgList.length === 0 ? (
                    <div className="text-center py-8">
                        <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">
                            {i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                        </p>
                    </div>
                ) : (
                    <KcForm
                        kcContext={kcContext}
                        action={url.loginAction}
                        method="post"
                        id="kc-select-organization-form"
                    >
                        <div className="space-y-3">
                            {orgList.map((org, index) => (
                                <div key={org.alias || index}>
                                    <KcButton
                                        kcContext={kcContext}
                                        type="submit"
                                        name="orgId"
                                        value={org.alias}
                                        variant={index === 0 ? "default" : "outline"}
                                        className="w-full justify-start"
                                    >
                                        <Building2 className="mr-2 h-4 w-4" />
                                        {org.name || org.alias}
                                    </KcButton>
                                    {index < orgList.length - 1 && <Separator className="my-3" />}
                                </div>
                            ))}
                        </div>
                    </KcForm>
                )}
            </KcCard>
        </div>
    );
}


