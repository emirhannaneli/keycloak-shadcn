import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcCard, KcButton, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Mail, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

export default function LoginVerifyEmailPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-verify-email.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { message, user, url, realm } = kcContext;

    const realmName = realm?.displayName || realm?.name || "";
    const title = i18nToString(i18n, "emailVerifyTitle") || i18nToString(i18n, "loginTitle", undefined, realmName);

    // Document title'ı ayarla
    useEffect(() => {
        const titleText = typeof title === "string" ? title.replace(/<[^>]*>/g, "") : title;
        document.title = titleText || "Email Verification";
    }, [title]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={title}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-6" />}

                <div className="space-y-4">
                    <div className="flex items-center justify-center">
                        {message?.type === "success" ? (
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                        ) : (
                            <Mail className="h-16 w-16 text-primary" />
                        )}
                    </div>

                    {user?.email && (
                        <div className="text-center">
                            <p className="font-medium">{user.email}</p>
                        </div>
                    )}

                    {url.loginAction && (
                        <div className="mt-6">
                            <KcButton
                                kcContext={kcContext}
                                className="w-full"
                                onClick={() => {
                                    window.location.href = url.loginAction;
                                }}
                            >
                                {i18nToString(i18n, "doContinue")}
                            </KcButton>
                        </div>
                    )}
                </div>
            </KcCard>
        </div>
    );
}

