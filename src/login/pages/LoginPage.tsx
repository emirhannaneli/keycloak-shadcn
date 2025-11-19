import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcInput, KcButton, KcCard, KcAlert, KcCheckbox } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import React from "react";
import { 
    type LucideIcon
} from "lucide-react";

// Google SVG ikonu - img/social/google.svg
const GoogleIcon = ({ className, resourcePath }: { className?: string; resourcePath: (path: string) => string }) => (
    <img src={resourcePath("img/social/google.svg")} alt="Google" className={className} />
);

// Microsoft SVG ikonu - img/social/microsoft.svg
const MicrosoftIcon = ({ className, resourcePath }: { className?: string; resourcePath: (path: string) => string }) => (
    <img src={resourcePath("img/social/microsoft.svg")} alt="Microsoft" className={className} />
);

// Facebook SVG ikonu - img/social/facebook.svg
const FacebookIcon = ({ className, resourcePath }: { className?: string; resourcePath: (path: string) => string }) => (
    <img src={resourcePath("img/social/facebook.svg")} alt="Facebook" className={className} />
);

// Instagram SVG ikonu - img/social/instagram.svg
const InstagramIcon = ({ className, resourcePath }: { className?: string; resourcePath: (path: string) => string }) => (
    <img src={resourcePath("img/social/instagram.svg")} alt="Instagram" className={className} />
);

// Twitter/X SVG ikonu - img/social/x.svg (koyu temada invert filtresi)
const TwitterIcon = ({ className, resourcePath }: { className?: string; resourcePath: (path: string) => string }) => (
    <img 
        src={resourcePath("img/social/x.svg")} 
        alt="X (Twitter)" 
        className={`${className} dark:invert`} 
    />
);

// LinkedIn SVG ikonu - img/social/linkedin.svg
const LinkedinIcon = ({ className, resourcePath }: { className?: string; resourcePath: (path: string) => string }) => (
    <img src={resourcePath("img/social/linkedin.svg")} alt="LinkedIn" className={className} />
);

// GitHub SVG ikonu - img/social/github.svg (koyu temada invert filtresi)
const GithubIcon = ({ className, resourcePath }: { className?: string; resourcePath: (path: string) => string }) => (
    <img 
        src={resourcePath("img/social/github.svg")} 
        alt="GitHub" 
        className={`${className} dark:invert`} 
    />
);

// GitLab SVG ikonu - img/social/gitlab.svg
const GitlabIcon = ({ className, resourcePath }: { className?: string; resourcePath: (path: string) => string }) => (
    <img src={resourcePath("img/social/gitlab.svg")} alt="GitLab" className={className} />
);

// Bitbucket SVG ikonu - img/social/bitbucket.svg
const BitbucketIcon = ({ className, resourcePath }: { className?: string; resourcePath: (path: string) => string }) => (
    <img src={resourcePath("img/social/bitbucket.svg")} alt="Bitbucket" className={className} />
);

// PayPal SVG ikonu - img/social/paypal.svg
const PayPalIcon = ({ className, resourcePath }: { className?: string; resourcePath: (path: string) => string }) => (
    <img src={resourcePath("img/social/paypal.svg")} alt="PayPal" className={className} />
);

// StackOverflow SVG ikonu - img/social/stackoverflow.svg
const StackOverflowIcon = ({ className, resourcePath }: { className?: string; resourcePath: (path: string) => string }) => (
    <img src={resourcePath("img/social/stackoverflow.svg")} alt="StackOverflow" className={className} />
);

// OpenShift SVG ikonu - img/social/openshift.svg
const OpenShiftIcon = ({ className, resourcePath }: { className?: string; resourcePath: (path: string) => string }) => (
    <img src={resourcePath("img/social/openshift.svg")} alt="OpenShift" className={className} />
);

// Provider ID'ye göre ikon eşleştirmesi
function getProviderIcon(providerId: string | undefined, resourcePath: (path: string) => string): React.ComponentType<{ className?: string }> | LucideIcon | null {
    if (!providerId) return null;
    
    const iconMap: Record<string, React.ComponentType<{ className?: string; resourcePath: (path: string) => string }> | LucideIcon> = {
        google: GoogleIcon,
        facebook: FacebookIcon,
        instagram: InstagramIcon,
        twitter: TwitterIcon,
        linkedin: LinkedinIcon,
        github: GithubIcon,
        gitlab: GitlabIcon,
        bitbucket: BitbucketIcon,
        microsoft: MicrosoftIcon,
        openshift: OpenShiftIcon,
        paypal: PayPalIcon,
        stackoverflow: StackOverflowIcon,
    };
    
    const normalizedId = providerId.toLowerCase();
    const IconComponent = iconMap[normalizedId];
    if (!IconComponent) return null;
    
    // IconComponent bir function ise resourcePath ile wrap et
    if (typeof IconComponent === 'function') {
        return (props: { className?: string }) => <IconComponent {...props} resourcePath={resourcePath} />;
    }
    
    return IconComponent;
}

export default function LoginPage({ kcContext }: { kcContext: Extract<KcContext, { pageId: "login.ftl" }> }) {
    const { i18n } = useI18n({ kcContext });

    const {
        url,
        realm,
        login,
        social,
        messagesPerField,
        message,
        usernameHidden,
        auth,
        themeName,
    } = kcContext;

    // Keycloakify'da production build'de static dosyalar için path
    const getResourcePath = (path: string) => {
        // Development'ta keycloakify-dev-resources
        if (import.meta.env.DEV) {
            return `/keycloakify-dev-resources/login/${path}`;
        }
        // Production'da Keycloak'ın resources path'i
        // Favicon path'inden yola çıkarak: /resources/6k3sb/login/keycloak-shadcn/dist/favicon-32x32.png
        // Yani path yapısı: /resources/{realm-id}/login/{theme-name}/dist/...
        // url.resourcesPath muhtemelen /resources/{realm-id}/login/{theme-name} formatında
        // Dosyalar dist/ klasörü altında olmalı
        let resourcesPath = (url as any).resourcesPath;
        if (!resourcesPath) {
            // url.resourcesPath yoksa, favicon path'inden yola çıkarak oluştur
            // Ancak realm-id'yi bilmiyoruz, bu yüzden geçici olarak theme name ile oluştur
            resourcesPath = `/resources/${themeName || 'keycloak-shadcn'}`;
        }
        // Path yapısı: /resources/{realm-id}/login/{theme-name}/dist/img/...
        // Eğer resourcesPath zaten /login/{theme-name} içeriyorsa, sadece /dist ekle
        // Eğer içermiyorsa, /login/{theme-name}/dist ekle
        if (resourcesPath.includes('/login/')) {
            return `${resourcesPath}/dist/${path}`;
        }
        return `${resourcesPath}/login/${themeName || 'keycloak-shadcn'}/dist/${path}`;
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Sistem Logosu */}
                <div className="flex justify-center">
                    <img 
                        src={getResourcePath("img/keycloak-logo-text.png")} 
                        alt="Keycloak" 
                        className="h-20"
                    />
                </div>
                
                <KcCard 
                    kcContext={kcContext} 
                    title={
                        (() => {
                            const realmName = realm.displayName || realm.name || "";
                            // loginTitleHtml key'ini dene
                            const htmlTitle = (i18nToString as any)(i18n, "loginTitleHtml", { 0: realmName }, realmName);
                            
                            // Eğer loginTitleHtml çevrildiyse (boş değilse ve key'den farklıysa) kullan
                            if (htmlTitle && htmlTitle !== "loginTitleHtml" && htmlTitle !== "") {
                                return htmlTitle;
                            }
                            
                            // Fallback: loginTitle kullan ve realm adını ekle
                            const baseTitle = i18nToString(i18n, "loginTitle");
                            if (realmName && baseTitle.includes("{0}")) {
                                return baseTitle.replace("{0}", realmName);
                            }
                            return realmName ? `${baseTitle} ${realmName}` : baseTitle;
                        })()
                    }
                    className="w-full"
                >
                    {message && <KcAlert message={message} className="mb-4" />}

                    <KcForm
                        kcContext={kcContext}
                        action={url.loginAction}
                        method="post"
                        id="kc-form-login"
                    >
                        {!usernameHidden && (
                            <div className="space-y-4 mb-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">
                                        {!realm.loginWithEmailAllowed
                                            ? i18nToString(i18n, "username")
                                            : !realm.registrationEmailAsUsername
                                              ? i18nToString(i18n, "usernameOrEmail")
                                              : i18nToString(i18n, "email")}
                                    </Label>
                                    <KcInput
                                        kcContext={kcContext}
                                        id="username"
                                        name="username"
                                        defaultValue={login.username ?? ""}
                                        autoFocus={true}
                                        autoComplete="username"
                                        aria-invalid={messagesPerField.existsError("username", "password")}
                                        aria-describedby={
                                            messagesPerField.existsError("username", "password")
                                                ? "input-error"
                                                : undefined
                                        }
                                        className={
                                            messagesPerField.existsError("username", "password")
                                                ? "border-destructive"
                                                : ""
                                        }
                                    />
                                    {messagesPerField.existsError("username", "password") && (
                                        <span id="input-error" className="text-sm text-destructive">
                                            {messagesPerField.getFirstError("username", "password")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">{i18nToString(i18n, "password")}</Label>
                                <KcInput
                                    kcContext={kcContext}
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoFocus={usernameHidden}
                                    autoComplete="current-password"
                                    aria-invalid={messagesPerField.existsError("username", "password")}
                                    aria-describedby={
                                        messagesPerField.existsError("username", "password")
                                            ? "input-error"
                                            : undefined
                                    }
                                    className={
                                        messagesPerField.existsError("username", "password")
                                            ? "border-destructive"
                                            : ""
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                {realm.rememberMe && !usernameHidden ? (
                                    <KcCheckbox
                                        kcContext={kcContext}
                                        id="rememberMe"
                                        name="rememberMe"
                                        label={i18nToString(i18n, "rememberMe")}
                                    />
                                ) : null}

                                {realm.resetPasswordAllowed && (
                                    <a
                                        href={url.loginResetCredentialsUrl}
                                        className="text-sm text-primary underline-offset-4 hover:underline"
                                    >
                                        {i18nToString(i18n, "doForgotPassword")}
                                    </a>
                                )}
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="hidden"
                                    id="id-hidden-input"
                                    name="credentialId"
                                    value={auth?.selectedCredential}
                                />
                                <KcButton
                                    kcContext={kcContext}
                                    name="login"
                                    id="kc-login"
                                    className="w-full"
                                >
                                    {i18nToString(i18n, "doLogIn")}
                                </KcButton>
                            </div>
                        </div>
                    </KcForm>

                    {realm.password && social?.providers !== undefined && social.providers.length > 0 && (
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        {i18nToString(i18n, "identity-provider-login-label")}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                {social.providers.map((p) => {
                                    const Icon = getProviderIcon(p.providerId, getResourcePath);
                                    return (
                                    <KcButton
                                        key={p.alias}
                                        kcContext={kcContext}
                                        type="button"
                                        variant="outline"
                                            className="h-12 w-12 p-0 flex items-center justify-center"
                                        onClick={() => {
                                            window.location.href = p.loginUrl;
                                        }}
                                            title={p.displayName}
                                            aria-label={p.displayName}
                                        >
                                            {Icon ? (
                                                typeof Icon === 'function' ? (
                                                    <Icon className="h-6 w-6" />
                                                ) : (
                                                    React.createElement(Icon, { className: "h-6 w-6" })
                                                )
                                            ) : (
                                                <span className="text-xs truncate px-1">{p.displayName}</span>
                                            )}
                                        </KcButton>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {realm.registrationAllowed && (
                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">
                                {i18nToString(i18n, "noAccount")}{" "}
                            </span>
                            <a
                                href={url.registrationUrl}
                                className="text-primary underline-offset-4 hover:underline"
                            >
                                {i18nToString(i18n, "doRegister")}
                            </a>
                        </div>
                    )}
                </KcCard>
            </div>
        </div>
    );
}

