import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert, KcInput } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

export default function TotpPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "totp.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, totp, mode } = kcContext;

    const title = i18nToString(i18n, "authenticatorTitleHtml" as any) || i18nToString(i18n, "authenticatorTitle" as any) || "Authenticator";

    // Document title'ı ayarla
    useEffect(() => {
        const titleText = typeof title === "string" ? title.replace(/<[^>]*>/g, "") : title;
        document.title = titleText || "Authenticator";
    }, [title]);

    // URL'den referrer parametrelerini al
    const [referrerParams, setReferrerParams] = useState<{ referrer?: string; referrer_uri?: string }>({});
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const params: { referrer?: string; referrer_uri?: string } = {};
        if (urlParams.has("referrer")) {
            params.referrer = urlParams.get("referrer") || undefined;
        }
        if (urlParams.has("referrer_uri")) {
            params.referrer_uri = urlParams.get("referrer_uri") || undefined;
        }
        setReferrerParams(params);
    }, []);

    // Totp objesi yoksa bilgi mesajı göster ama sayfa açılsın
    // Form gösterilmez çünkü totp objesi olmadan form çalışmaz

    // Totp objesi yoksa sadece bilgi mesajı göster
    if (!totp) {
        return (
            <KcCard
                kcContext={kcContext}
                title={title}
                className="w-full max-w-3xl"
            >
                <p className="text-muted-foreground text-center py-8">
                    {i18nToString(i18n, "totpNotAvailable" as any) || "TOTP authenticator is not available. Please contact your administrator."}
                </p>
            </KcCard>
        );
    }

    const isManualMode = mode === "manual";
    const isTotpEnabled = totp.enabled === true;
    const hasCredentials = totp.otpCredentials && Array.isArray(totp.otpCredentials) && totp.otpCredentials.length > 0;
    const supportedApplications = totp.supportedApplications || [];
    const policy = totp.policy || {};

    // Mesajı filtrele: TOTP ayarlaması yapılmamışsa "removed" mesajlarını gösterme
    const shouldShowMessage = message && (
        isTotpEnabled || 
        !message.summary?.toLowerCase().includes("removed")
    );

    return (
        <KcCard
                kcContext={kcContext}
                title={title}
                className="w-full max-w-3xl"
            >
                {shouldShowMessage && <KcAlert message={message} className="mb-4" />}

                {/* Mevcut TOTP Credentials Listesi */}
                {isTotpEnabled && hasCredentials && (
                    <div className="mb-6 space-y-4">
                        <h3 className="text-lg font-semibold">
                            {i18nToString(i18n, "configuredAuthenticators" as any) || "Configured Authenticators"}
                        </h3>
                        {totp.otpCredentials?.map((credential) => (
                            <div
                                key={credential.id}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 border rounded-lg"
                            >
                                <span>{credential.userLabel || i18nToString(i18n, "authenticator") || "Authenticator"}</span>
                                {url.totpUrl && (
                                <KcForm
                                    kcContext={kcContext}
                                    action={url.totpUrl}
                                    method="post"
                                >
                                    <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />
                                    <input type="hidden" name="submitAction" value="Delete" />
                                    <input type="hidden" name="credentialId" value={credential.id} />
                                    {referrerParams.referrer && (
                                        <input type="hidden" name="referrer" value={referrerParams.referrer} />
                                    )}
                                    {referrerParams.referrer_uri && (
                                        <input type="hidden" name="referrer_uri" value={referrerParams.referrer_uri} />
                                    )}
                                    <KcButton
                                        kcContext={kcContext}
                                        type="submit"
                                        variant="destructive"
                                        size="sm"
                                    >
                                        {i18nToString(i18n, "doDelete" as any) || "Delete"}
                                    </KcButton>
                                </KcForm>
                                )}
                            </div>
                        ))}
                        <Separator />
                    </div>
                )}

                {/* TOTP Yapılandırma Bölümü */}
                {!isTotpEnabled && (
                    <div className="space-y-6">
                        {/* Desteklenen Uygulamalar Listesi */}
                        {supportedApplications.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">
                                    {i18nToString(i18n, "totpAppAvailable" as any) || "Available Applications"}
                                </Label>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                                    {supportedApplications.map((app, index) => (
                                        <li key={index}>
                                            {i18nToString(i18n, app as any) || app}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Policy Bilgileri */}
                        {policy.type && (
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">
                                    {i18nToString(i18n, "totpPolicyType" as any) || "Policy Type"}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {policy.type}
                                    {policy.algorithm && ` - ${policy.algorithm}`}
                                </p>
                            </div>
                        )}

                        {/* QR Code Mode */}
                        {!isManualMode && totp.totpSecretQrCode && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">
                                        {i18nToString(i18n, "totpScanBarcode" as any) || "Scan QR Code"}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {i18nToString(i18n, "totpScanBarcodeDescription" as any) || "Scan this QR code with your authenticator app"}
                                    </p>
                                </div>
                                <div className="flex justify-center">
                                    <img
                                        src={`data:image/png;base64,${totp.totpSecretQrCode}`}
                                        alt="TOTP QR Code"
                                        className="border rounded-lg p-2 bg-white"
                                    />
                                </div>
                                {totp.manualUrl && (
                                    <div className="text-center">
                                        <a
                                            href={totp.manualUrl}
                                            className="text-sm text-muted-foreground hover:underline"
                                        >
                                            {i18nToString(i18n, "totpManualEntry" as any) || "Manual Entry"}
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Manual Mode */}
                        {isManualMode && totp.totpSecretEncoded && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">
                                        {i18nToString(i18n, "totpSecret" as any) || "TOTP Secret"}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {i18nToString(i18n, "totpManualEntryDescription" as any) || "Enter this code manually in your authenticator app"}
                                    </p>
                                    <div className="p-4 bg-muted rounded-lg font-mono text-center text-lg break-all">
                                        {totp.totpSecretEncoded}
                                    </div>
                                </div>
                                {totp.qrUrl && (
                                    <div className="text-center">
                                        <a
                                            href={totp.qrUrl}
                                            className="text-sm text-muted-foreground hover:underline"
                                        >
                                            {i18nToString(i18n, "totpScanBarcode") || "Scan Barcode"}
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TOTP Form */}
                        {url.totpUrl && (
                        <KcForm
                            kcContext={kcContext}
                            action={url.totpUrl}
                            method="post"
                            id="kc-totp-settings-form"
                        >
                            <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />
                            <input type="hidden" name="submitAction" value="Save" />
                            {totp.totpSecret && (
                                <input type="hidden" name="totpSecret" value={totp.totpSecret} />
                            )}
                            {referrerParams.referrer && (
                                <input type="hidden" name="referrer" value={referrerParams.referrer} />
                            )}
                            {referrerParams.referrer_uri && (
                                <input type="hidden" name="referrer_uri" value={referrerParams.referrer_uri} />
                            )}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="totp">
                                        {i18nToString(i18n, "totpOneTime" as any) || "One-time Code"}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {i18nToString(i18n, "totpOneTimeDescription" as any) || "Enter the code from your authenticator app"}
                                    </p>
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
                                                ? "totp-error"
                                                : undefined
                                        }
                                        className={
                                            messagesPerField.existsError("totp")
                                                ? "border-destructive"
                                                : ""
                                        }
                                    />
                                    {messagesPerField.existsError("totp") && (
                                        <span id="totp-error" className="text-sm text-destructive">
                                            {messagesPerField.get("totp")}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="userLabel">
                                        {i18nToString(i18n, "totpDeviceName") || "Device Name"}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {i18nToString(i18n, "totpDeviceNameDescription" as any) || "Give a name to this device for easy identification"}
                                    </p>
                                    <KcInput
                                        kcContext={kcContext}
                                        id="userLabel"
                                        name="userLabel"
                                        type="text"
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="mt-6">
                                    <KcButton
                                        kcContext={kcContext}
                                        type="submit"
                                        className="w-full"
                                    >
                                        {i18nToString(i18n, "doSubmit" as any) || "Submit"}
                                    </KcButton>
                                </div>
                            </div>
                        </KcForm>
                        )}
                    </div>
                )}
            </KcCard>
    );
}
