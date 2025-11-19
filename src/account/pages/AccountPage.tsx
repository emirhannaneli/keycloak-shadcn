import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert, KcInput } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";

export default function AccountPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "account.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, account, realm, referrer } = kcContext;

    const showUsername = !realm?.registrationEmailAsUsername;
    const canEditUsername = realm?.editUsernameAllowed ?? false;

    const realmName: string = (realm && "displayName" in realm && typeof realm.displayName === "string" ? realm.displayName : undefined) || 
                      (realm && "name" in realm && typeof realm.name === "string" ? realm.name : undefined) || "";
    const titleHtml = i18nToString(i18n, "accountTitleHtml" as any, realmName ? { 0: realmName } : undefined, realmName);
    const titlePlain = i18nToString(i18n, "accountTitle" as any, realmName ? { 0: realmName } : undefined, realmName);
    const title = titleHtml || titlePlain || "Account";

    return (
        <KcCard
            kcContext={kcContext}
            title={title}
            className="w-full mx-auto"
        >
                {message && <KcAlert message={message} className="mb-4" />}

                <div className="mb-4 text-sm text-muted-foreground">
                    <span className="text-destructive">*</span> {i18nToString(i18n, "requiredFields") || "Required fields"}
                </div>

                <KcForm
                    kcContext={kcContext}
                    action={url.accountUrl}
                    method="post"
                    id="kc-account-form"
                    className="w-full"
                >
                    <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />

                    <div className="space-y-4 w-full">
                        {showUsername && (
                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    {i18nToString(i18n, "username")}
                                    {canEditUsername && <span className="text-destructive">*</span>}
                                </Label>
                                <KcInput
                                    kcContext={kcContext}
                                    id="username"
                                    name="username"
                                    defaultValue={account?.username ?? ""}
                                    disabled={!canEditUsername}
                                    required={canEditUsername}
                                    autoComplete="username"
                                    aria-invalid={messagesPerField.existsError("username")}
                                    aria-describedby={
                                        messagesPerField.existsError("username")
                                            ? "username-error"
                                            : undefined
                                    }
                                    className={
                                        messagesPerField.existsError("username")
                                            ? "border-destructive"
                                            : ""
                                    }
                                />
                                {messagesPerField.existsError("username") && (
                                    <span id="username-error" className="text-sm text-destructive">
                                        {messagesPerField.get("username")}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                {i18nToString(i18n, "email")}
                                <span className="text-destructive">*</span>
                            </Label>
                            <KcInput
                                kcContext={kcContext}
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={account?.email ?? ""}
                                required
                                autoComplete="email"
                                aria-invalid={messagesPerField.existsError("email")}
                                aria-describedby={
                                    messagesPerField.existsError("email")
                                        ? "email-error"
                                        : undefined
                                }
                                className={
                                    messagesPerField.existsError("email")
                                        ? "border-destructive"
                                        : ""
                                }
                            />
                            {messagesPerField.existsError("email") && (
                                <span id="email-error" className="text-sm text-destructive">
                                    {messagesPerField.get("email")}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="firstName">
                                {i18nToString(i18n, "firstName")}
                                <span className="text-destructive">*</span>
                            </Label>
                            <KcInput
                                kcContext={kcContext}
                                id="firstName"
                                name="firstName"
                                defaultValue={account?.firstName ?? ""}
                                required
                                autoComplete="given-name"
                                aria-invalid={messagesPerField.existsError("firstName")}
                                aria-describedby={
                                    messagesPerField.existsError("firstName")
                                        ? "firstName-error"
                                        : undefined
                                }
                                className={
                                    messagesPerField.existsError("firstName")
                                        ? "border-destructive"
                                        : ""
                                }
                            />
                            {messagesPerField.existsError("firstName") && (
                                <span id="firstName-error" className="text-sm text-destructive">
                                    {messagesPerField.get("firstName")}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">
                                {i18nToString(i18n, "lastName")}
                                <span className="text-destructive">*</span>
                            </Label>
                            <KcInput
                                kcContext={kcContext}
                                id="lastName"
                                name="lastName"
                                defaultValue={account?.lastName ?? ""}
                                required
                                autoComplete="family-name"
                                aria-invalid={messagesPerField.existsError("lastName")}
                                aria-describedby={
                                    messagesPerField.existsError("lastName")
                                        ? "lastName-error"
                                        : undefined
                                }
                                className={
                                    messagesPerField.existsError("lastName")
                                        ? "border-destructive"
                                        : ""
                                }
                            />
                            {messagesPerField.existsError("lastName") && (
                                <span id="lastName-error" className="text-sm text-destructive">
                                    {messagesPerField.get("lastName")}
                                </span>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                            {referrer?.url && (
                                <KcButton
                                    kcContext={kcContext}
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        window.location.href = referrer.url;
                                    }}
                                >
                                    {i18nToString(i18n, "doCancel") || "Cancel"}
                                </KcButton>
                            )}
                            <KcButton
                                kcContext={kcContext}
                                type="submit"
                            >
                                {i18nToString(i18n, "doSubmit" as any) || "Submit"}
                            </KcButton>
                        </div>
                    </div>
                </KcForm>
            </KcCard>
    );
}
