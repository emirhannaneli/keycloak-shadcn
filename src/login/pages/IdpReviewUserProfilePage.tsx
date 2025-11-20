import { type KcContext } from "../KcContext";
import { useI18n } from "../i18n";
import { KcForm, KcButton, KcCard, KcAlert, KcInput } from "../components";
import { Label } from "@/components/ui/label";
import { Suspense, lazy } from "react";
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

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <KcCard
                kcContext={kcContext}
                title={i18nToString(i18n, "loginTitle", undefined, realm?.displayName || realm?.name || "")}
                className="w-full max-w-md"
            >
                {message && <KcAlert message={message} className="mb-4" />}

                <div className="flex items-center justify-center mb-6">
                    <User className="h-12 w-12 text-primary" />
                </div>

                <KcForm
                    kcContext={kcContext}
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
                            {i18nToString(i18n, "doSubmit")}
                        </KcButton>
                    </div>
                </KcForm>
            </KcCard>
        </div>
    );
}

