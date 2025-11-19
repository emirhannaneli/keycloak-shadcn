import { Suspense } from "react";
import type { ClassKey } from "keycloakify/account";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/account/DefaultPage";
import Template from "keycloakify/account/Template";
import { PageWrapper } from "./components/PageWrapper";
import AccountPage from "./pages/AccountPage";
import PasswordPage from "./pages/PasswordPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import SessionsPage from "./pages/SessionsPage";
import TotpPage from "./pages/TotpPage";
import FederatedIdentityPage from "./pages/FederatedIdentityPage";
import LogPage from "./pages/LogPage";

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const { i18n } = useI18n({ kcContext });

    return (
        <PageWrapper kcContext={kcContext}>
            <Suspense>
                {(() => {
                    switch (kcContext.pageId) {
                        case "account.ftl":
                            return <AccountPage kcContext={kcContext} />;
                        case "password.ftl":
                            return <PasswordPage kcContext={kcContext} />;
                        case "applications.ftl":
                            return <ApplicationsPage kcContext={kcContext} />;
                        case "sessions.ftl":
                            return <SessionsPage kcContext={kcContext} />;
                        case "totp.ftl":
                            return <TotpPage kcContext={kcContext} />;
                        case "federatedIdentity.ftl":
                            return <FederatedIdentityPage kcContext={kcContext} />;
                        case "log.ftl":
                            return <LogPage kcContext={kcContext} />;
                        default:
                            return <DefaultPage kcContext={kcContext} i18n={i18n} classes={classes} Template={Template} doUseDefaultCss={true} />;
                    }
                })()}
            </Suspense>
        </PageWrapper>
    );
}

const classes = {} satisfies { [key in ClassKey]?: string };
