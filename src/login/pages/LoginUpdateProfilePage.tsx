import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert, KcInput } from "../components";
import { Label } from "@/components/ui/label";
import { i18nToString } from "../utils/i18n";
import { Suspense, lazy, useEffect } from "react";
const UserProfileFormFields = lazy(
    () => import("keycloakify/login/UserProfileFormFields")
);

export default function LoginUpdateProfilePage({
    kcContext,
}: {
    kcContext: Extract<KcContext, { pageId: "login-update-profile.ftl" }>;
}) {
    const { i18n } = useI18n({ kcContext });

    const { url, messagesPerField, message, isAppInitiatedAction, realm } = kcContext;

    const realmName = realm?.displayName || realm?.name || "";
    const title = i18nToString(i18n, "loginProfileTitle") || i18nToString(i18n, "loginTitle", undefined, realmName);

    // Document title'ı ayarla
    useEffect(() => {
        const titleText = typeof title === "string" ? title.replace(/<[^>]*>/g, "") : title;
        document.title = titleText || "Update Account Information";
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
                    id="kc-update-profile-form"
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
                                                {attribute.required && (
                                                    <span className="text-destructive">*</span>
                                                )}
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
                                                    <span className="text-sm text-destructive">
                                                        {error}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    },
                                } as any)}
                            />
                        </div>
                    </Suspense>

                    <div className="mt-6 flex gap-3">
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
                </KcForm>
            </KcCard>
        </div>
    );
}

