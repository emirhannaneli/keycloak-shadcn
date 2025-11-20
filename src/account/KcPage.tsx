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

    // realm undefined olabilir, bu yüzden güvenli bir şekilde kontrol ediyoruz
    // Mevcut realm objesini koruyarak sadece eksik özelliği ekliyoruz
    const safeKcContext = {
        ...kcContext,
        realm: kcContext.realm ? {
            ...kcContext.realm,
            internationalizationEnabled: kcContext.realm.internationalizationEnabled ?? false
        } : {
            userManagedAccessAllowed: true,
            internationalizationEnabled: false
        }
    };

    const { i18n } = useI18n({ kcContext: safeKcContext as any });

    return (
        <PageWrapper kcContext={safeKcContext as any}>
            <Suspense>
                {(() => {
                    switch (kcContext.pageId) {
                        case "account.ftl":
                            return <AccountPage kcContext={safeKcContext as any} />;
                        case "password.ftl":
                            return <PasswordPage kcContext={safeKcContext as any} />;
                        case "applications.ftl":
                            return <ApplicationsPage kcContext={safeKcContext as any} />;
                        case "sessions.ftl":
                            return <SessionsPage kcContext={safeKcContext as any} />;
                        case "totp.ftl":
                            return <TotpPage kcContext={safeKcContext as any} />;
                        case "federatedIdentity.ftl":
                            return <FederatedIdentityPage kcContext={safeKcContext as any} />;
                        case "log.ftl":
                            return <LogPage kcContext={safeKcContext as any} />;
                        default:
                            return <DefaultPage kcContext={safeKcContext as any} i18n={i18n} classes={classes} Template={Template} doUseDefaultCss={true} />;
                    }
                })()}
            </Suspense>
        </PageWrapper>
    );
}

const classes = {} satisfies { [key in ClassKey]?: string };
