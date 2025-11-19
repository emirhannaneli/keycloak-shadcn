import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert } from "../components";
import { i18nToString } from "../utils/i18n";
import { Smartphone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function LoginResetOtpPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-reset-otp.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, configuredOtpCredentials, realm } = kcContext;

    const userOtpCredentials = configuredOtpCredentials?.userOtpCredentials ?? [];
    const selectedCredentialId = configuredOtpCredentials?.selectedCredentialId;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-4" />}

                <div className="flex items-center justify-center mb-6">
                    <Smartphone className="h-12 w-12 text-primary" />
                </div>

                <KcForm
                    kcContext={kcContext}
                    action={url.loginAction}
                    method="post"
                    id="kc-reset-otp-form"
                >
                    <div className="space-y-4">
                        {userOtpCredentials.length > 0 && (
                            <div className="space-y-2">
                                <Select
                                    name="selectedCredentialId"
                                    defaultValue={selectedCredentialId}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {userOtpCredentials.map((credential) => (
                                            <SelectItem key={credential.id} value={credential.id}>
                                                {credential.userLabel || credential.id}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {messagesPerField.existsError("totp") && (
                                    <span className="text-sm text-destructive">
                                        {messagesPerField.getFirstError("totp")}
                                    </span>
                                )}
                            </div>
                        )}

                        <Separator />

                        <div className="space-y-2">
                            <KcButton
                                kcContext={kcContext}
                                type="submit"
                                name="submitAction"
                                value="Reset"
                                variant="destructive"
                                className="w-full"
                            >
                                <Smartphone className="mr-2 h-4 w-4" />
                                {i18nToString(i18n, "doSubmit")}
                            </KcButton>
                        </div>
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}


