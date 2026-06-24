import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert, KcInput } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Shield, Link2, Monitor, Grid, Mail, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useAccountProfile, type AccountUpdatePayload } from "../utils/accountProfile";

export default function AccountPage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "account.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, account, realm, referrer } = kcContext;

    const showUsername = !realm?.registrationEmailAsUsername;
    const canEditUsername = realm?.editUsernameAllowed ?? false;

    // Fields handled outside the dynamic-attribute loop (rendered explicitly or
    // managed by Keycloak itself), so they are not shown as custom attributes.
    const standardFields = ["username", "email", "firstName", "lastName", "locale"];

    // The legacy account.ftl context does NOT carry User Profile metadata
    // (input type, options, required, ...). So — exactly like keycloak.v3 — we read
    // and write the profile through the Account REST API, using a token obtained
    // via the public `account-console` client. See ../utils/accountProfile.ts.
    const { state: profileState, save } = useAccountProfile({ accountUrl: url.accountUrl });
    const restReady = profileState.status === "ready";
    const restProfile = restReady ? profileState.profile : undefined;

    // Errors / status for the REST-based save (keycloak.v3 style).
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Surface why the REST path failed (token/redirect-uri/CORS) so it can be fixed;
    // we still degrade gracefully to the legacy HTML form POST + account.attributes.
    useEffect(() => {
        if (profileState.status === "error") {
            console.warn(
                "[AccountPage] Account REST API unavailable, falling back to legacy form. Reason:",
                profileState.error
            );
        }
    }, [profileState]);

    // Prefer authoritative REST values once loaded; otherwise the FreeMarker context.
    const fieldValue = (name: "username" | "email" | "firstName" | "lastName") =>
        (restProfile?.[name] ?? account?.[name] ?? "") as string;

    // Combine REST field errors with any server-rendered (legacy form) errors.
    const getError = (field: string): string | undefined => {
        if (fieldErrors[field]) return fieldErrors[field];
        return messagesPerField.existsError(field) ? messagesPerField.get(field) : undefined;
    };

    const handleRestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        if (!save) return; // not ready -> let the native HTML form POST happen
        e.preventDefault();
        setSaving(true);
        setSaveSuccess(false);
        setFieldErrors({});

        const form = e.currentTarget;
        const data = new FormData(form);
        const getStr = (name: string) => {
            const v = data.get(name);
            return typeof v === "string" ? v : "";
        };

        const payload: AccountUpdatePayload = {
            email: getStr("email"),
            firstName: getStr("firstName"),
            lastName: getStr("lastName"),
            attributes: {}
        };
        if (showUsername && canEditUsername) payload.username = getStr("username");
        for (const attribute of dynamicAttributes) {
            if (attribute.readOnly) continue;
            payload.attributes![attribute.name] = [getStr(attribute.name)];
        }

        const result = await save(payload);
        setSaving(false);
        if (result.ok) {
            setSaveSuccess(true);
            return;
        }
        const errs: Record<string, string> = {};
        for (const err of result.errors) {
            if (err.field) errs[err.field] = err.errorMessage ?? "Invalid value";
        }
        if (result.message && Object.keys(errs).length === 0) errs["__global"] = result.message;
        setFieldErrors(errs);
    };

    const dynamicAttributes = useMemo(() => {
        // Preferred: full User Profile metadata from the Account REST API.
        if (profileState.status === "ready") {
            const meta = profileState.profile.userProfileMetadata?.attributes ?? [];
            const values = profileState.profile.attributes ?? {};
            return meta
                .filter(attr => attr.name && !standardFields.includes(attr.name))
                .map(attr => {
                    const displayName =
                        attr.displayName && !/^\$\{.*\}$/.test(attr.displayName)
                            ? attr.displayName
                            : attr.name;
                    return {
                        name: attr.name,
                        value: values[attr.name] ?? [],
                        displayName,
                        required: attr.required ?? false,
                        readOnly: attr.readOnly ?? false,
                        annotations: (attr.annotations ?? {}) as Record<string, any>,
                        validators: attr.validators
                    };
                });
        }
        // Fallback (loading / error / dev): legacy raw values, no metadata.
        const raw = (account as any)?.attributes as Record<string, unknown> | undefined;
        if (!raw) return [];
        return Object.entries(raw)
            .filter(([name]) => name && !standardFields.includes(name))
            .map(([name, value]) => ({
                name,
                value: Array.isArray(value) ? value : value == null ? "" : value,
                displayName: name,
                required: false,
                readOnly: false,
                annotations: {} as Record<string, any>,
                validators: undefined as Record<string, Record<string, unknown>> | undefined
            }));
    }, [profileState, account]);

    const realmName: string = (realm && "displayName" in realm && typeof realm.displayName === "string" ? realm.displayName : undefined) || 
                      (realm && "name" in realm && typeof realm.name === "string" ? realm.name : undefined) || "";
    const titleHtml = i18nToString(i18n, "accountTitleHtml" as any, realmName ? { 0: realmName } : undefined, realmName);
    const titlePlain = i18nToString(i18n, "accountTitle" as any, realmName ? { 0: realmName } : undefined, realmName);
    const title = titleHtml || titlePlain || "Account";

    // Set document title
    useEffect(() => {
        const titleText = typeof title === "string" ? title.replace(/<[^>]*>/g, "") : title;
        document.title = titleText || "Account";
    }, [title]);

    // State for statistics
    const [activeSessionsCount, setActiveSessionsCount] = useState<number>(0);
    const [applicationsCount, setApplicationsCount] = useState<number>(0);
    const [federatedIdentitiesCount, setFederatedIdentitiesCount] = useState<number>(0);

    // Email verified status - get from account object or kcContext
    const emailVerified: boolean = (account as any)?.emailVerified ?? (kcContext as any)?.account?.emailVerified ?? false;

    // Get data from kcContext
    useEffect(() => {
        // If there are direct data in kcContext, use them
        const contextSessions = (kcContext as any).sessions;
        const contextApplications = (kcContext as any).applications;
        const contextFederatedIdentity = (kcContext as any).federatedIdentity;

        if (contextSessions?.sessions && Array.isArray(contextSessions.sessions)) {
            setActiveSessionsCount(contextSessions.sessions.length);
        }
        if (contextApplications?.applications && Array.isArray(contextApplications.applications)) {
            setApplicationsCount(contextApplications.applications.length);
        }
        if (contextFederatedIdentity?.identities && Array.isArray(contextFederatedIdentity.identities)) {
            setFederatedIdentitiesCount(contextFederatedIdentity.identities.length);
        }
    }, [kcContext]);

    // Quick access links
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
            {/* Summary Cards */}
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

            {/* Quick Access */}
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

            {/* Account Information Form */}
            <KcCard
                kcContext={kcContext}
                title={title}
                className="w-full mx-auto"
            >
                {message && <KcAlert message={message} className="mb-4" />}
                {saveSuccess && (
                    <KcAlert
                        message={{
                            type: "success",
                            summary:
                                i18nToString(i18n, "accountUpdatedMessage" as any) ||
                                "Your account has been updated."
                        }}
                        className="mb-4"
                    />
                )}
                {fieldErrors["__global"] && (
                    <KcAlert message={{ type: "error", summary: fieldErrors["__global"] }} className="mb-4" />
                )}

                <div className="mb-4 text-sm text-muted-foreground">
                    <span className="text-destructive">*</span> {i18nToString(i18n, "requiredFields") || "Required fields"}
                </div>

                <KcForm
                    key={restReady ? "rest" : "legacy"}
                    action={url.accountUrl}
                    method="post"
                    id="kc-account-form"
                    className="w-full"
                    onSubmit={handleRestSubmit}
                >
                    <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />

                    <div className="space-y-4 w-full">
                        {/* Standard Fields */}
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
                                    defaultValue={fieldValue("username")}
                                    disabled={!canEditUsername}
                                    required={canEditUsername}
                                    autoComplete="username"
                                    aria-invalid={!!getError("username")}
                                    aria-describedby={getError("username") ? "username-error" : undefined}
                                    className={getError("username") ? "border-destructive" : ""}
                                />
                                {getError("username") && (
                                    <span id="username-error" className="text-sm text-destructive">
                                        {getError("username")}
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
                                defaultValue={fieldValue("email")}
                                required
                                autoComplete="email"
                                aria-invalid={!!getError("email")}
                                aria-describedby={getError("email") ? "email-error" : undefined}
                                className={getError("email") ? "border-destructive" : ""}
                            />
                            {getError("email") && (
                                <span id="email-error" className="text-sm text-destructive">
                                    {getError("email")}
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
                                defaultValue={fieldValue("firstName")}
                                required
                                autoComplete="given-name"
                                aria-invalid={!!getError("firstName")}
                                aria-describedby={getError("firstName") ? "firstName-error" : undefined}
                                className={getError("firstName") ? "border-destructive" : ""}
                            />
                            {getError("firstName") && (
                                <span id="firstName-error" className="text-sm text-destructive">
                                    {getError("firstName")}
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
                                defaultValue={fieldValue("lastName")}
                                required
                                autoComplete="family-name"
                                aria-invalid={!!getError("lastName")}
                                aria-describedby={getError("lastName") ? "lastName-error" : undefined}
                                className={getError("lastName") ? "border-destructive" : ""}
                            />
                            {getError("lastName") && (
                                <span id="lastName-error" className="text-sm text-destructive">
                                    {getError("lastName")}
                                </span>
                            )}
                        </div>

                        {/* Dynamic Attributes */}
                        {dynamicAttributes.map((attribute: any) => {
                            // Declarative User Profile reads form params by plain attribute name.
                            const fieldName = attribute.name;
                            const errorMessage = getError(fieldName);
                            const hasError = !!errorMessage;
                            const attributeValue = Array.isArray(attribute.value) 
                                ? attribute.value[0] || "" 
                                : attribute.value || "";
                            
                            // Determine input type based on attribute type
                            const inputType = attribute.annotations?.["inputType"] || 
                                           attribute.annotations?.["input-type"] || 
                                           "text";
                            
                            // Options for Select
                            const options = attribute.validators?.options?.options || 
                                          attribute.annotations?.["options"] || 
                                          [];

                            return (
                                <div key={attribute.name} className="space-y-2">
                                    <Label htmlFor={fieldName}>
                                        {attribute.displayName || attribute.name}
                                        {attribute.required && <span className="text-destructive">*</span>}
                                    </Label>
                                    
                                    {inputType === "select" && options.length > 0 ? (
                                        <>
                                            <input
                                                type="hidden"
                                                name={fieldName}
                                                id={`${fieldName}-hidden`}
                                                value={attributeValue}
                                            />
                                            <Select
                                                defaultValue={attributeValue}
                                                onValueChange={(value) => {
                                                    const hiddenInput = document.getElementById(`${fieldName}-hidden`) as HTMLInputElement;
                                                    if (hiddenInput) {
                                                        hiddenInput.value = value;
                                                    }
                                                }}
                                                disabled={attribute.readOnly}
                                            >
                                                <SelectTrigger
                                                    className={
                                                        hasError ? "border-destructive" : ""
                                                    }
                                                    aria-invalid={hasError}
                                                    aria-describedby={
                                                        hasError ? `${fieldName}-error` : undefined
                                                    }
                                                >
                                                    <SelectValue placeholder={
                                                        i18nToString(i18n, `profile.attributes.${attribute.name}.placeholder` as any) ||
                                                        `Select ${attribute.displayName || attribute.name}`
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {options.map((option: string) => (
                                                        <SelectItem key={option} value={option}>
                                                            {i18nToString(
                                                                i18n,
                                                                `profile.attributes.${attribute.name}.options.${option}` as any
                                                            ) || option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </>
                                    ) : inputType === "checkbox" || inputType === "boolean" ? (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={fieldName}
                                                name={fieldName}
                                                defaultChecked={attributeValue === "true" || attributeValue === true}
                                                disabled={attribute.readOnly}
                                                required={attribute.required}
                                            />
                                            <label
                                                htmlFor={fieldName}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {i18nToString(
                                                    i18n,
                                                    `profile.attributes.${attribute.name}.label` as any
                                                ) || attribute.displayName || attribute.name}
                                            </label>
                                        </div>
                                    ) : inputType === "textarea" ? (
                                        <Textarea
                                            id={fieldName}
                                            name={fieldName}
                                            defaultValue={attributeValue}
                                            required={attribute.required}
                                            disabled={attribute.readOnly}
                                            rows={attribute.annotations?.["rows"] || 4}
                                            className={
                                                hasError ? "border-destructive" : ""
                                            }
                                            aria-invalid={hasError}
                                            aria-describedby={
                                                hasError ? `${fieldName}-error` : undefined
                                            }
                                        />
                                    ) : (
                                        <KcInput
                                            kcContext={kcContext}
                                            id={fieldName}
                                            name={fieldName}
                                            type={inputType === "email" ? "email" : 
                                                  inputType === "tel" ? "tel" : 
                                                  inputType === "url" ? "url" : 
                                                  inputType === "number" ? "number" : "text"}
                                            defaultValue={attributeValue}
                                            required={attribute.required}
                                            disabled={attribute.readOnly}
                                            placeholder={
                                                i18nToString(i18n, `profile.attributes.${attribute.name}.placeholder` as any) || ""
                                            }
                                            className={
                                                hasError ? "border-destructive" : ""
                                            }
                                            aria-invalid={hasError}
                                            aria-describedby={
                                                hasError ? `${fieldName}-error` : undefined
                                            }
                                        />
                                    )}
                                    
                                    {hasError && (
                                        <span id={`${fieldName}-error`} className="text-sm text-destructive">
                                            {errorMessage}
                                        </span>
                                    )}
                                    
                                    {attribute.annotations?.["inputHelperText"] && (
                                        <p className="text-xs text-muted-foreground">
                                            {i18nToString(
                                                i18n,
                                                attribute.annotations["inputHelperText"] as any
                                            ) || attribute.annotations["inputHelperText"]}
                                        </p>
                                    )}
                                </div>
                            );
                        })}

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
                                disabled={saving}
                            >
                                {saving
                                    ? i18nToString(i18n, "doSaving" as any) || "Saving..."
                                    : i18nToString(i18n, "doSubmit" as any) || "Submit"}
                            </KcButton>
                        </div>
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}
