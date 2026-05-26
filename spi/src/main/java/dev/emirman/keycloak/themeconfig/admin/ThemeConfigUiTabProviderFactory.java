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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

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

    // Phase 3 — colors (shared across light + dark)
    private static final String KEY_COLOR_PRIMARY = "colorPrimary";
    private static final String KEY_COLOR_SECONDARY = "colorSecondary";
    private static final String KEY_COLOR_ACCENT = "colorAccent";

    // Phase 3 — colors (mode-specific)
    private static final String KEY_COLOR_BG_LIGHT = "colorBackgroundLight";
    private static final String KEY_COLOR_BG_DARK = "colorBackgroundDark";
    private static final String KEY_COLOR_FG_LIGHT = "colorForegroundLight";
    private static final String KEY_COLOR_FG_DARK = "colorForegroundDark";

    // Phase 3 — logo sizes (in px)
    private static final String KEY_LOGO_H_LOGIN = "logoHeightLogin";
    private static final String KEY_LOGO_H_ACCOUNT = "logoHeightAccount";

    private static final Pattern HEX_COLOR = Pattern.compile("^#[0-9a-fA-F]{6}$");
    private static final Pattern POSITIVE_INT = Pattern.compile("^[1-9][0-9]{0,3}$");

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
        return "Custom logo and favicon URLs served by the Theme Config SPI to login and account pages. "
                + "Changes propagate within ~30 seconds — browsers and the SPI both cache the values for "
                + "that duration. To see updates immediately, users can hard-refresh (Ctrl+Shift+R) or "
                + "clear the 'kc-theme-config' entry from localStorage.";
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        List<ProviderConfigProperty> props = new ArrayList<>();

        // Phase 1+2 — logos / favicon
        props.add(new ProviderConfigProperty(
                KEY_LOGO_LIGHT, "Light logo URL",
                "URL of the logo shown in light mode. Leave blank to fall back to the bundled default.",
                ProviderConfigProperty.STRING_TYPE, null));
        props.add(new ProviderConfigProperty(
                KEY_LOGO_DARK, "Dark logo URL",
                "URL of the logo shown in dark mode. Falls back to the light logo if blank.",
                ProviderConfigProperty.STRING_TYPE, null));
        props.add(new ProviderConfigProperty(
                KEY_FAVICON, "Favicon URL",
                "URL of the browser tab icon. Leave blank to keep the bundled favicon.",
                ProviderConfigProperty.STRING_TYPE, null));

        // Phase 3 — colors (shared)
        props.add(new ProviderConfigProperty(
                KEY_COLOR_PRIMARY, "Primary color",
                "Button / accent color. HEX (#RRGGBB). Used in both light and dark mode. Leave blank to keep theme default.",
                ProviderConfigProperty.STRING_TYPE, null));
        props.add(new ProviderConfigProperty(
                KEY_COLOR_SECONDARY, "Secondary color",
                "Secondary accent color. HEX (#RRGGBB). Used in both modes. Leave blank for default.",
                ProviderConfigProperty.STRING_TYPE, null));
        props.add(new ProviderConfigProperty(
                KEY_COLOR_ACCENT, "Accent color",
                "Highlight / focus ring color. HEX (#RRGGBB). Used in both modes. Leave blank for default.",
                ProviderConfigProperty.STRING_TYPE, null));

        // Phase 3 — colors (mode-specific)
        props.add(new ProviderConfigProperty(
                KEY_COLOR_BG_LIGHT, "Background (light mode)",
                "Page background in light mode. HEX (#RRGGBB). Leave blank for default white.",
                ProviderConfigProperty.STRING_TYPE, null));
        props.add(new ProviderConfigProperty(
                KEY_COLOR_BG_DARK, "Background (dark mode)",
                "Page background in dark mode. HEX. Leave blank for default near-black.",
                ProviderConfigProperty.STRING_TYPE, null));
        props.add(new ProviderConfigProperty(
                KEY_COLOR_FG_LIGHT, "Foreground (light mode)",
                "Primary text color in light mode. HEX. Leave blank for default near-black.",
                ProviderConfigProperty.STRING_TYPE, null));
        props.add(new ProviderConfigProperty(
                KEY_COLOR_FG_DARK, "Foreground (dark mode)",
                "Primary text color in dark mode. HEX. Leave blank for default white.",
                ProviderConfigProperty.STRING_TYPE, null));

        // Phase 3 — logo sizes
        props.add(new ProviderConfigProperty(
                KEY_LOGO_H_LOGIN, "Login logo height (px)",
                "Logo height on Login/Register pages. Default: 80. Leave blank for default.",
                ProviderConfigProperty.STRING_TYPE, null));
        props.add(new ProviderConfigProperty(
                KEY_LOGO_H_ACCOUNT, "Account logo height (px)",
                "Logo height on Account console. Default: 48. Leave blank for default.",
                ProviderConfigProperty.STRING_TYPE, null));

        return props;
    }

    @Override
    public void validateConfiguration(KeycloakSession session, RealmModel realm, ComponentModel component)
            throws ComponentValidationException {
        validateUrl(component, KEY_LOGO_LIGHT, "Light logo URL");
        validateUrl(component, KEY_LOGO_DARK, "Dark logo URL");
        validateUrl(component, KEY_FAVICON, "Favicon URL");

        validateHexColor(component, KEY_COLOR_PRIMARY, "Primary color");
        validateHexColor(component, KEY_COLOR_SECONDARY, "Secondary color");
        validateHexColor(component, KEY_COLOR_ACCENT, "Accent color");
        validateHexColor(component, KEY_COLOR_BG_LIGHT, "Background (light mode)");
        validateHexColor(component, KEY_COLOR_BG_DARK, "Background (dark mode)");
        validateHexColor(component, KEY_COLOR_FG_LIGHT, "Foreground (light mode)");
        validateHexColor(component, KEY_COLOR_FG_DARK, "Foreground (dark mode)");

        validatePositiveInt(component, KEY_LOGO_H_LOGIN, "Login logo height (px)");
        validatePositiveInt(component, KEY_LOGO_H_ACCOUNT, "Account logo height (px)");
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

    private void validateHexColor(ComponentModel component, String key, String label)
            throws ComponentValidationException {
        String raw = component.getConfig().getFirst(key);
        if (raw == null || raw.isBlank()) {
            return;
        }
        if (!HEX_COLOR.matcher(raw.trim()).matches()) {
            throw new ComponentValidationException(
                    "'" + label + "' must be a HEX color like #0066cc (6 digits, # prefix).");
        }
    }

    private void validatePositiveInt(ComponentModel component, String key, String label)
            throws ComponentValidationException {
        String raw = component.getConfig().getFirst(key);
        if (raw == null || raw.isBlank()) {
            return;
        }
        if (!POSITIVE_INT.matcher(raw.trim()).matches()) {
            throw new ComponentValidationException(
                    "'" + label + "' must be a positive integer (1-9999 px).");
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

        syncOne(realm, component, KEY_COLOR_PRIMARY);
        syncOne(realm, component, KEY_COLOR_SECONDARY);
        syncOne(realm, component, KEY_COLOR_ACCENT);
        syncOne(realm, component, KEY_COLOR_BG_LIGHT);
        syncOne(realm, component, KEY_COLOR_BG_DARK);
        syncOne(realm, component, KEY_COLOR_FG_LIGHT);
        syncOne(realm, component, KEY_COLOR_FG_DARK);

        syncOne(realm, component, KEY_LOGO_H_LOGIN);
        syncOne(realm, component, KEY_LOGO_H_ACCOUNT);
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

        realm.removeAttribute(ATTR_PREFIX + KEY_COLOR_PRIMARY);
        realm.removeAttribute(ATTR_PREFIX + KEY_COLOR_SECONDARY);
        realm.removeAttribute(ATTR_PREFIX + KEY_COLOR_ACCENT);
        realm.removeAttribute(ATTR_PREFIX + KEY_COLOR_BG_LIGHT);
        realm.removeAttribute(ATTR_PREFIX + KEY_COLOR_BG_DARK);
        realm.removeAttribute(ATTR_PREFIX + KEY_COLOR_FG_LIGHT);
        realm.removeAttribute(ATTR_PREFIX + KEY_COLOR_FG_DARK);

        realm.removeAttribute(ATTR_PREFIX + KEY_LOGO_H_LOGIN);
        realm.removeAttribute(ATTR_PREFIX + KEY_LOGO_H_ACCOUNT);
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
