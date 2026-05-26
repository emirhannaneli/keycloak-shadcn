package dev.emirman.keycloak.themeconfig.admin;

import org.keycloak.Config;
import org.keycloak.component.ComponentModel;
import org.keycloak.component.ComponentValidationException;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.models.RealmModel;
import org.keycloak.provider.ProviderConfigProperty;
import org.keycloak.services.ui.extend.UiTabProvider;
import org.keycloak.services.ui.extend.UiTabProviderFactory;

import java.util.List;
import java.util.Map;

/**
 * Adds a "Theme Config" tab under Realm Settings in the Keycloak admin console.
 * Form values are stored in a per-realm ComponentModel (so the form pre-populates
 * on re-open) and mirrored to realm.attributes["theme.*"] so the Phase 1
 * ThemeConfigResourceProvider continues to serve them to the theme.
 *
 * <p>Requires the experimental feature flag: <code>--features=declarative-ui</code>
 * (Keycloak 26.0, 26.1, 26.3+; the tab is hidden on 26.2.x due to upstream
 * regression keycloak#39971).</p>
 */
public class ThemeConfigUiTabProviderFactory
        implements UiTabProvider, UiTabProviderFactory<ComponentModel> {

    public static final String ID = "theme-config";
    private static final String ATTR_PREFIX = "theme.";

    private static final String KEY_LOGO_LIGHT = "logoLight";
    private static final String KEY_LOGO_DARK = "logoDark";
    private static final String KEY_FAVICON = "faviconUrl";

    @Override
    public String getId() {
        return ID;
    }

    @Override
    public String getPath() {
        return "/:realm/realm-settings/:tab";
    }

    @Override
    public Map<String, String> getParams() {
        return Map.of("tab", ID);
    }

    @Override
    public String getHelpText() {
        return "Custom logo and favicon URLs served by the Theme Config SPI to login and account pages.";
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        return List.of(
                new ProviderConfigProperty(
                        KEY_LOGO_LIGHT,
                        "Light logo URL",
                        "URL of the logo shown in light mode. Leave blank to fall back to the bundled default.",
                        ProviderConfigProperty.STRING_TYPE,
                        null
                ),
                new ProviderConfigProperty(
                        KEY_LOGO_DARK,
                        "Dark logo URL",
                        "URL of the logo shown in dark mode. Falls back to the light logo if blank.",
                        ProviderConfigProperty.STRING_TYPE,
                        null
                ),
                new ProviderConfigProperty(
                        KEY_FAVICON,
                        "Favicon URL",
                        "URL of the browser tab icon. Leave blank to keep the bundled favicon.",
                        ProviderConfigProperty.STRING_TYPE,
                        null
                )
        );
    }

    @Override
    public void validateConfiguration(KeycloakSession session, RealmModel realm, ComponentModel component)
            throws ComponentValidationException {
        validateUrl(component, KEY_LOGO_LIGHT, "Light logo URL");
        validateUrl(component, KEY_LOGO_DARK, "Dark logo URL");
        validateUrl(component, KEY_FAVICON, "Favicon URL");
    }

    private void validateUrl(ComponentModel component, String key, String label) throws ComponentValidationException {
        String raw = component.getConfig().getFirst(key);
        if (raw == null || raw.isBlank()) {
            return; // blank clears the attribute — valid
        }
        String value = raw.trim();
        boolean shaped =
                value.startsWith("http://") ||
                value.startsWith("https://") ||
                value.startsWith("data:image/") ||
                value.startsWith("/");
        if (!shaped) {
            throw new ComponentValidationException(
                    "'" + label + "' must be a URL (http(s)://..., data:image/..., or /...)."
            );
        }
    }

    @Override
    public void onCreate(KeycloakSession session, RealmModel realm, ComponentModel component) {
        syncToRealmAttributes(realm, component);
    }

    @Override
    public void onUpdate(KeycloakSession session, RealmModel realm, ComponentModel oldComponent, ComponentModel component) {
        syncToRealmAttributes(realm, component);
    }

    private void syncToRealmAttributes(RealmModel realm, ComponentModel component) {
        syncOne(realm, component, KEY_LOGO_LIGHT);
        syncOne(realm, component, KEY_LOGO_DARK);
        syncOne(realm, component, KEY_FAVICON);
    }

    private void syncOne(RealmModel realm, ComponentModel component, String key) {
        String raw = component.getConfig().getFirst(key);
        String attrKey = ATTR_PREFIX + key;
        if (raw == null || raw.isBlank()) {
            realm.removeAttribute(attrKey);
        } else {
            realm.setAttribute(attrKey, raw.trim());
        }
    }

    @Override
    public void preRemove(KeycloakSession session, RealmModel realm, ComponentModel component) {
        realm.removeAttribute(ATTR_PREFIX + KEY_LOGO_LIGHT);
        realm.removeAttribute(ATTR_PREFIX + KEY_LOGO_DARK);
        realm.removeAttribute(ATTR_PREFIX + KEY_FAVICON);
    }

    @Override
    public void init(Config.Scope config) {
    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {
    }

    @Override
    public void close() {
    }
}
