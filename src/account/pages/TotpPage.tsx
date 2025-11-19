import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert, KcInput } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function TotpPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "totp.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, totp, mode } = kcContext;

    const isManualMode = mode === "manual";

    return (
        <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "authenticatorTitleHtml") || i18nToString(i18n, "authenticatorTitle") || "Authenticator"}
                className="w-full max-w-3xl"
            >
                {message && <KcAlert message={message} className="mb-4" />}

                {totp?.enabled && totp.otpCredentials && totp.otpCredentials.length > 0 && (
                    <div className="mb-6 space-y-4">
                        <h3 className="text-lg font-semibold">
                            {i18nToString(i18n, "configuredAuthenticators") || "Configured Authenticators"}
                        </h3>
                        {totp.otpCredentials.map((credential) => (
                            <div
                                key={credential.id}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 border rounded-lg"
                            >
                                <span>{credential.userLabel || i18nToString(i18n, "authenticator") || "Authenticator"}</span>
                                <KcForm
                                    kcContext={kcContext}
                                    action={url.totpUrl}
                                    method="post"
                                >
                                    <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />
                                    <input type="hidden" name="action" value="delete" />
                                    <input type="hidden" name="credentialId" value={credential.id} />
                                    <KcButton
                                        kcContext={kcContext}
                                        type="submit"
                                        variant="destructive"
                                        size="sm"
                                    >
                                        {i18nToString(i18n, "doDelete") || "Delete"}
                                    </KcButton>
                                </KcForm>
                            </div>
                        ))}
                        <Separator />
                    </div>
                )}

                {!totp?.enabled && (
                    <div className="space-y-6">
                        {!isManualMode && totp?.totpSecretQrCode && (
                            <div className="space-y-4">
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
                                            {i18nToString(i18n, "totpManualEntry") || "Manual Entry"}
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {isManualMode && totp?.totpSecretEncoded && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{i18nToString(i18n, "totpSecret") || "TOTP Secret"}</Label>
                                    <div className="p-4 bg-muted rounded-lg font-mono text-center text-lg">
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

                        <KcForm
                            kcContext={kcContext}
                            action={url.totpUrl}
                            method="post"
                            id="kc-totp-settings-form"
                        >
                            <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="totp">
                                        {i18nToString(i18n, "totpOneTime") || "One-time Code"}
                                    </Label>
                                    <KcInput
                                        kcContext={kcContext}
                                        id="totp"
                                        name="totp"
                                        type="text"
                                        autoFocus={true}
                                        autoComplete="off"
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
                                            {messagesPerField.getFirstError("totp")}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="userLabel">
                                        {i18nToString(i18n, "totpDeviceName") || "Device Name"}
                                    </Label>
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
                                        {i18nToString(i18n, "doSubmit") || "Submit"}
                                    </KcButton>
                                </div>
                            </div>
                        </KcForm>
                    </div>
                )}
            </KcCard>
    );
}
