import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert, KcInput } from "../components";
import { Suspense, lazy, useMemo } from "react";
import { i18nToString } from "../utils/i18n";
import { User } from "lucide-react";

const UserProfileFormFields = lazy(
    () => import("keycloakify/login/UserProfileFormFields")
);

export default function IdpReviewUserProfilePage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "idp-review-user-profile.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, realm } = kcContext;

    const realmName = realm?.displayName || realm?.name || "";
    const title = i18nToString(i18n, "loginIdpReviewProfileTitle") || i18nToString(i18n, "loginTitle", undefined, realmName);

    // inputComponent'i memoize et
    const inputComponent = useMemo(() => {
        return (props: any) => {
            // UserProfileFormFields'den gelen tüm props'ları al
            const { 
                value, 
                defaultValue, 
                name,
                id,
                type,
                autoComplete,
                autoFocus,
                disabled,
                required,
                tabIndex,
                className: propsClassName,
                ...restProps 
            } = props;
            
            // value varsa controlled component, yoksa uncontrolled
            const inputValue = value !== undefined && value !== null
                ? { value }
                : { defaultValue: value ?? defaultValue ?? "" };
            
            return (
                <KcInput
                    {...restProps}
                    kcContext={kcContext}
                    name={name}
                    id={id || name}
                    type={type || "text"}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    required={required}
                    tabIndex={tabIndex}
                    {...inputValue}
                    className={
                        messagesPerField.existsError(name)
                            ? `border-destructive ${propsClassName || ""}`
                            : propsClassName || ""
                    }
                />
            );
        };
    }, [kcContext, messagesPerField]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={title}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-4" />}

                <div className="flex items-center justify-center mb-6">
                    <User className="h-12 w-12 text-primary" />
                </div>

                <KcForm
                    action={url.loginAction}
                    method="post"
                    id="kc-idp-review-user-profile-form"
                >
                    <Suspense>
                        <div className="space-y-4">
                            <UserProfileFormFields
                                {...({
                                    kcContext,
                                    i18n,
                                    kcClsx: () => "",
                                    doMakeUserConfirmPassword: false,
                                    onIsFormSubmittableValueChange: () => {},
                                    inputComponent,
                                    BeforeField: () => null,
                                    AfterField: ({ attribute }: { attribute: any }) => {
                                        const error = messagesPerField.existsError(attribute.name)
                                            ? messagesPerField.getFirstError(attribute.name)
                                            : undefined;

                                        if (!error) return null;

                                        return (
                                            <div className="mt-1">
                                                <span className="text-sm text-destructive">{error}</span>
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
                            {i18nToString(i18n, "doSubmit")}
                        </KcButton>
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}

