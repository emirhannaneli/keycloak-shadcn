import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcCheckbox } from "../components";
import { i18nToString } from "../utils/i18n";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

export default function TermsPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "terms.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, realm } = kcContext;
    const termsText = (kcContext as any)["x-keycloakify"]?.messages?.termsText || "";

    const realmName = realm?.displayName || realm?.name || "";
    const title = i18nToString(i18n, "termsTitle") || i18nToString(i18n, "loginTitle", undefined, realmName);

    // Document title'ı ayarla
    useEffect(() => {
        const titleText = typeof title === "string" ? title.replace(/<[^>]*>/g, "") : title;
        document.title = titleText || "Terms and Conditions";
    }, [title]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={title}
                className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="flex-1 overflow-y-auto pr-2 mb-4">
                    <div
                        className="prose prose-sm max-w-none text-foreground"
                        dangerouslySetInnerHTML={{ __html: termsText }}
                    />
                </div>

                <Separator className="my-4" />

                <KcForm
                    kcContext={kcContext}
                    action={url.loginAction}
                    method="post"
                    id="kc-tos-form"
                >
                    <div className="space-y-4">
                        <KcCheckbox
                            kcContext={kcContext}
                            id="termsAccepted"
                            name="termsAccepted"
                            required={true}
                            label={i18nToString(i18n, "doAccept")}
                        />

                        <KcButton
                            kcContext={kcContext}
                            type="submit"
                            className="w-full"
                        >
                            {i18nToString(i18n, "doAccept")}
                        </KcButton>
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}

