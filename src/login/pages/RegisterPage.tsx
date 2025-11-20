import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert, KcInput } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import { Suspense, lazy } from "react";
import { 
    type LucideIcon
} from "lucide-react";
import React from "react";

const UserProfileFormFields = lazy(
    () => import("keycloakify/login/UserProfileFormFields")
);

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

export default function RegisterPage({ kcContext }: { kcContext: Extract<KcContext, { pageId: "register.ftl" }> }) {
    const { i18n } = useI18n({ kcContext });

    const {
        url,
        messagesPerField,
        message,
        social,
        themeName,
    } = kcContext as any;

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
                
                <KcCard kcContext={kcContext} title={i18nToString(i18n, "registerTitle")} className="w-full">
                    {message && <KcAlert message={message} className="mb-4" />}

                    <KcForm
                        kcContext={kcContext}
                        action={url.registrationAction}
                        method="post"
                        id="kc-register-form"
                    >
                        <Suspense>
                            <div className="space-y-4">
                                <UserProfileFormFields
                                    {...({
                                        kcContext,
                                        i18n,
                                        kcClsx: () => "",
                                        doMakeUserConfirmPassword: true,
                                        onIsFormSubmittableValueChange: () => {},
                                        inputComponent: (props: any) => (
                                            <KcInput
                                                {...props}
                                                kcContext={kcContext}
                                                className={
                                                    messagesPerField.existsError(props.name)
                                                        ? "border-destructive"
                                                        : props.className
                                                }
                                            />
                                        ),
                                        BeforeField: ({ attribute }: { attribute: any }) => (
                                            <div className="space-y-2 mb-2">
                                                <Label htmlFor={attribute.name}>
                                                    {attribute.displayName ?? ""}
                                                    {attribute.required && <span className="text-destructive">*</span>}
                                                </Label>
                                            </div>
                                        ),
                                        AfterField: ({ attribute }: { attribute: any }) => {
                                            const error = messagesPerField.existsError(attribute.name)
                                                ? messagesPerField.getFirstError(attribute.name)
                                                : undefined;

                                            return (
                                                <div className="mt-1">
                                                    {error && (
                                                        <span className="text-sm text-destructive">{error}</span>
                                                    )}
                                                </div>
                                            );
                                        },
                                    } as any)}
                                />
                            </div>
                        </Suspense>

                        <div className="mt-6 space-y-4">
                            <KcButton
                                kcContext={kcContext}
                                type="submit"
                                className="w-full"
                            >
                                {i18nToString(i18n, "doRegister")}
                            </KcButton>
                        </div>
                    </KcForm>

                    {social?.providers !== undefined && social.providers.length > 0 && (
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
                                {social.providers.map((p: any) => {
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

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">
                            {i18nToString(i18n, "noAccount")}{" "}
                        </span>
                        <a
                            href={url.loginUrl}
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            {i18nToString(i18n, "doLogIn")}
                        </a>
                    </div>
                </KcCard>
            </div>
        </div>
    );
}

