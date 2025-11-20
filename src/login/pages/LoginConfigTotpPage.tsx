import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcInput, KcButton, KcCard, KcAlert } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

export default function LoginConfigTotpPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-config-totp.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, totp, mode, isAppInitiatedAction, realm } =
        kcContext;

    const realmName = realm?.displayName || realm?.name || "";
    const title = i18nToString(i18n, "loginTotpTitle") || i18nToString(i18n, "loginTitle", undefined, realmName);

    // Document title'ı ayarla
    useEffect(() => {
        const titleText = typeof title === "string" ? title.replace(/<[^>]*>/g, "") : title;
        document.title = titleText || "Mobile Authenticator Setup";
    }, [title]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={title}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-4" />}

                <KcForm
                    kcContext={kcContext}
                    action={url.loginAction}
                    method="post"
                    id="kc-totp-settings-form"
                >
                    <div className="space-y-4">
                        {mode === "qr" && totp?.qrUrl && (
                            <div className="space-y-2">
                                <Label>{i18nToString(i18n, "authenticatorCode")}</Label>
                                <div className="flex justify-center p-4 bg-muted rounded-md">
                                    <img
                                        src={totp.qrUrl}
                                        alt="QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                    {i18nToString(i18n, "authenticatorCode")}
                                </p>
                            </div>
                        )}

                        {mode === "manual" && totp?.manualUrl && (
                            <div className="space-y-2">
                                <Label>{i18nToString(i18n, "authenticatorCode")}</Label>
                                <div className="p-4 bg-muted rounded-md space-y-2">
                                    <p className="text-sm font-mono break-all">
                                        {totp.manualUrl}
                                    </p>
                                </div>
                            </div>
                        )}

                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="totp">
                                {i18nToString(i18n, "authenticatorCode")}
                            </Label>
                            <KcInput
                                kcContext={kcContext}
                                id="totp"
                                name="totp"
                                type="text"
                                autoFocus={true}
                                autoComplete="one-time-code"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                aria-invalid={messagesPerField.existsError("totp")}
                                aria-describedby={
                                    messagesPerField.existsError("totp")
                                        ? "input-error"
                                        : undefined
                                }
                                className={
                                    messagesPerField.existsError("totp")
                                        ? "border-destructive"
                                        : ""
                                }
                            />
                            {messagesPerField.existsError("totp") && (
                                <span id="input-error" className="text-sm text-destructive">
                                    {messagesPerField.getFirstError("totp")}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="userLabel">
                                {i18nToString(i18n, "authenticatorCode")}
                            </Label>
                            <KcInput
                                kcContext={kcContext}
                                id="userLabel"
                                name="userLabel"
                                type="text"
                            />
                        </div>

                        <div className="flex gap-3">
                            <KcButton
                                kcContext={kcContext}
                                type="submit"
                                className="flex-1"
                            >
                                {i18nToString(i18n, "doSubmit")}
                            </KcButton>
                            {isAppInitiatedAction && (
                                <KcButton
                                    kcContext={kcContext}
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        window.location.href = url.loginUrl;
                                    }}
                                >
                                    {i18nToString(i18n, "doCancel")}
                                </KcButton>
                            )}
                        </div>
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}

