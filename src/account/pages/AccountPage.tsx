import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert, KcInput } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Shield, Link2, Monitor, Grid, Mail, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

    // İstatistikler - varsayılan değerler (gerçek veriler diğer sayfalardan gelir)
    const activeSessionsCount: number = 0;
    const applicationsCount: number = 0;
    const federatedIdentitiesCount: number = 0;
    const emailVerified: boolean = false;

    // Hızlı erişim linkleri
    const quickLinks = [
        {
            id: "password",
            label: i18nToString(i18n, "passwordTitleHtml" as any) || i18nToString(i18n, "passwordTitle" as any) || "Password",
            icon: Lock,
            href: url.passwordUrl,
            description: i18nToString(i18n, "passwordTitle" as any) || "Change your password",
        },
        {
            id: "totp",
            label: i18nToString(i18n, "authenticatorTitleHtml" as any) || i18nToString(i18n, "authenticatorTitle" as any) || "Authenticator",
            icon: Shield,
            href: url.totpUrl,
            description: i18nToString(i18n, "authenticatorTitle" as any) || "Set up authenticator",
        },
        {
            id: "sessions",
            label: i18nToString(i18n, "sessionsTitleHtml" as any) || i18nToString(i18n, "sessionsTitle" as any) || "Sessions",
            icon: Monitor,
            href: url.sessionsUrl,
            description: i18nToString(i18n, "sessionsTitle" as any) || "Manage active sessions",
        },
        {
            id: "applications",
            label: i18nToString(i18n, "applicationsTitleHtml" as any) || i18nToString(i18n, "applicationsTitle" as any) || "Applications",
            icon: Grid,
            href: url.applicationsUrl,
            description: i18nToString(i18n, "applicationsTitle" as any) || "View authorized applications",
        },
    ];

    return (
        <div className="space-y-6 w-full">
            {/* Özet Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {i18nToString(i18n, "activeSessions" as any) || "Active Sessions"}
                        </CardTitle>
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeSessionsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeSessionsCount === 1 ? "session" : "sessions"} {i18nToString(i18n, "active" as any) || "active"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {i18nToString(i18n, "applications" as any) || "Applications"}
                        </CardTitle>
                        <Grid className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{applicationsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {i18nToString(i18n, "authorizedApps" as any) || "authorized applications"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {i18nToString(i18n, "federatedIdentity" as any) || "Federated Identity"}
                        </CardTitle>
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{federatedIdentitiesCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {i18nToString(i18n, "linkedAccounts" as any) || "linked accounts"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {i18nToString(i18n, "emailVerification" as any) || "Email Status"}
                        </CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            {emailVerified ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-medium">{i18nToString(i18n, "verified" as any) || "Verified"}</span>
                                </>
                            ) : (
                                <>
                                    <Badge variant="destructive">{i18nToString(i18n, "notVerified" as any) || "Not Verified"}</Badge>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {emailVerified 
                                ? i18nToString(i18n, "emailVerified" as any) || "Email is verified"
                                : i18nToString(i18n, "emailNotVerified" as any) || "Email not verified"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Hızlı Erişim */}
            <Card>
                <CardHeader>
                    <CardTitle>{i18nToString(i18n, "quickAccess" as any) || "Quick Access"}</CardTitle>
                    <CardDescription>
                        {i18nToString(i18n, "quickAccessDescription" as any) || "Quickly access important account settings"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quickLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <a
                                    key={link.id}
                                    href={link.href}
                                    className={cn(
                                        "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        "cursor-pointer"
                                    )}
                                >
                                    <div className="p-2 rounded-md bg-primary/10">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{link.label}</h3>
                                        <p className="text-sm text-muted-foreground">{link.description}</p>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Hesap Bilgileri Formu */}
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
        </div>
    );
}
