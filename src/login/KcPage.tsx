import { Suspense, lazy } from "react";
import type { ClassKey } from "keycloakify/login";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/login/DefaultPage";
import Template from "keycloakify/login/Template";
import { PageWrapper } from "./components/PageWrapper";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ErrorPage from "./pages/ErrorPage";
import InfoPage from "./pages/InfoPage";
import LoginUpdatePasswordPage from "./pages/LoginUpdatePasswordPage";
import LoginVerifyEmailPage from "./pages/LoginVerifyEmailPage";
import LoginUpdateProfilePage from "./pages/LoginUpdateProfilePage";
import LoginOtpPage from "./pages/LoginOtpPage";
import LoginConfigTotpPage from "./pages/LoginConfigTotpPage";
import TermsPage from "./pages/TermsPage";
import LogoutConfirmPage from "./pages/LogoutConfirmPage";
import LoginUsernamePage from "./pages/LoginUsernamePage";
import LoginPasswordPage from "./pages/LoginPasswordPage";
import CodePage from "./pages/CodePage";
import LoginPageExpiredPage from "./pages/LoginPageExpiredPage";
import SelectAuthenticatorPage from "./pages/SelectAuthenticatorPage";
import UpdateEmailPage from "./pages/UpdateEmailPage";
import LoginIdpLinkConfirmPage from "./pages/LoginIdpLinkConfirmPage";
import LoginIdpLinkConfirmOverridePage from "./pages/LoginIdpLinkConfirmOverridePage";
import LoginIdpLinkEmailPage from "./pages/LoginIdpLinkEmailPage";
import IdpReviewUserProfilePage from "./pages/IdpReviewUserProfilePage";
import LoginOauthGrantPage from "./pages/LoginOauthGrantPage";
import LoginOauth2DeviceVerifyUserCodePage from "./pages/LoginOauth2DeviceVerifyUserCodePage";
import WebauthnAuthenticatePage from "./pages/WebauthnAuthenticatePage";
import WebauthnRegisterPage from "./pages/WebauthnRegisterPage";
import WebauthnErrorPage from "./pages/WebauthnErrorPage";
import SelectOrganizationPage from "./pages/SelectOrganizationPage";
import DeleteAccountConfirmPage from "./pages/DeleteAccountConfirmPage";
import DeleteCredentialPage from "./pages/DeleteCredentialPage";
import LoginRecoveryAuthnCodeConfigPage from "./pages/LoginRecoveryAuthnCodeConfigPage";
import LoginRecoveryAuthnCodeInputPage from "./pages/LoginRecoveryAuthnCodeInputPage";
import LoginResetOtpPage from "./pages/LoginResetOtpPage";
import LoginX509InfoPage from "./pages/LoginX509InfoPage";
import LoginPasskeysConditionalAuthenticatePage from "./pages/LoginPasskeysConditionalAuthenticatePage";
import SamlPostFormPage from "./pages/SamlPostFormPage";
import FrontchannelLogoutPage from "./pages/FrontchannelLogoutPage";
const UserProfileFormFields = lazy(
    () => import("keycloakify/login/UserProfileFormFields")
);

const doMakeUserConfirmPassword = true;

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const { i18n } = useI18n({ kcContext });

    return (
        <PageWrapper kcContext={kcContext}>
            <Suspense>
                {(() => {
                    switch (kcContext.pageId) {
                    case "login.ftl":
                        return <LoginPage kcContext={kcContext} />;
                    case "register.ftl":
                        return <RegisterPage kcContext={kcContext} />;
                    case "login-reset-password.ftl":
                        return <ResetPasswordPage kcContext={kcContext} />;
                    case "error.ftl":
                        return <ErrorPage kcContext={kcContext} />;
                    case "info.ftl":
                        return <InfoPage kcContext={kcContext} />;
                    case "login-update-password.ftl":
                        return <LoginUpdatePasswordPage kcContext={kcContext} />;
                    case "login-verify-email.ftl":
                        return <LoginVerifyEmailPage kcContext={kcContext} />;
                    case "login-update-profile.ftl":
                        return <LoginUpdateProfilePage kcContext={kcContext} />;
                    case "login-otp.ftl":
                        return <LoginOtpPage kcContext={kcContext} />;
                    case "login-config-totp.ftl":
                        return <LoginConfigTotpPage kcContext={kcContext} />;
                    case "terms.ftl":
                        return <TermsPage kcContext={kcContext} />;
                    case "logout-confirm.ftl":
                        return <LogoutConfirmPage kcContext={kcContext} />;
                    case "login-username.ftl":
                        return <LoginUsernamePage kcContext={kcContext} />;
                    case "login-password.ftl":
                        return <LoginPasswordPage kcContext={kcContext} />;
                    case "code.ftl":
                        return <CodePage kcContext={kcContext} />;
                    case "login-page-expired.ftl":
                        return <LoginPageExpiredPage kcContext={kcContext} />;
                    case "select-authenticator.ftl":
                        return <SelectAuthenticatorPage kcContext={kcContext} />;
                    case "update-email.ftl":
                        return <UpdateEmailPage kcContext={kcContext} />;
                    case "login-idp-link-confirm.ftl":
                        return <LoginIdpLinkConfirmPage kcContext={kcContext} />;
                    case "login-idp-link-confirm-override.ftl":
                        return <LoginIdpLinkConfirmOverridePage kcContext={kcContext} />;
                    case "login-idp-link-email.ftl":
                        return <LoginIdpLinkEmailPage kcContext={kcContext} />;
                    case "idp-review-user-profile.ftl":
                        return <IdpReviewUserProfilePage kcContext={kcContext} />;
                    case "login-oauth-grant.ftl":
                        return <LoginOauthGrantPage kcContext={kcContext} />;
                    case "login-oauth2-device-verify-user-code.ftl":
                        return <LoginOauth2DeviceVerifyUserCodePage kcContext={kcContext} />;
                    case "webauthn-authenticate.ftl":
                        return <WebauthnAuthenticatePage kcContext={kcContext} />;
                    case "webauthn-register.ftl":
                        return <WebauthnRegisterPage kcContext={kcContext} />;
                    case "webauthn-error.ftl":
                        return <WebauthnErrorPage kcContext={kcContext} />;
                    case "select-organization.ftl":
                        return <SelectOrganizationPage kcContext={kcContext} />;
                    case "delete-account-confirm.ftl":
                        return <DeleteAccountConfirmPage kcContext={kcContext} />;
                    case "delete-credential.ftl":
                        return <DeleteCredentialPage kcContext={kcContext} />;
                    case "login-recovery-authn-code-config.ftl":
                        return <LoginRecoveryAuthnCodeConfigPage kcContext={kcContext} />;
                    case "login-recovery-authn-code-input.ftl":
                        return <LoginRecoveryAuthnCodeInputPage kcContext={kcContext} />;
                    case "login-reset-otp.ftl":
                        return <LoginResetOtpPage kcContext={kcContext} />;
                    case "login-x509-info.ftl":
                        return <LoginX509InfoPage kcContext={kcContext} />;
                    case "login-passkeys-conditional-authenticate.ftl":
                        return <LoginPasskeysConditionalAuthenticatePage kcContext={kcContext} />;
                    case "saml-post-form.ftl":
                        return <SamlPostFormPage kcContext={kcContext} />;
                    case "frontchannel-logout.ftl":
                        return <FrontchannelLogoutPage kcContext={kcContext} />;
                    default:
                        return (
                            <DefaultPage
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={classes}
                                Template={Template}
                                doUseDefaultCss={true}
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                    }
                })()}
            </Suspense>
        </PageWrapper>
    );
}

const classes = {} satisfies { [key in ClassKey]?: string };
