import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "./index.css";
import { KcPage } from "./kc.gen";

// The following block can be uncommented to test a specific page with `yarn dev`
// Don't forget to comment back or your bundle size will increase
/*
import { getKcContextMock } from "./account/KcPageStory";

if (import.meta.env.DEV) {
    window.kcContext = getKcContextMock({
        pageId: "log.ftl", // veya "totp.ftl" test etmek için
        overrides: {
            realm: {
                userManagedAccessAllowed: true,
                internationalizationEnabled: false
            }
        }
    });
}
*/

// realm undefined olabilir, bu yüzden güvenli bir şekilde kontrol ediyoruz
// Mevcut realm objesini koruyarak sadece eksik özelliği ekliyoruz
const safeKcContext = window.kcContext ? {
    ...window.kcContext,
    themeType: window.kcContext.themeType || "account", // themeType eksikse account olarak ayarla
    realm: window.kcContext.realm ? {
        ...window.kcContext.realm,
        internationalizationEnabled: window.kcContext.realm.internationalizationEnabled ?? false
    } : {
        userManagedAccessAllowed: true,
        internationalizationEnabled: false
    }
} : undefined;

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {!safeKcContext ? (
            <h1>No Keycloak Context</h1>
        ) : (
            <KcPage kcContext={safeKcContext as any} />
        )}
    </StrictMode>
);
