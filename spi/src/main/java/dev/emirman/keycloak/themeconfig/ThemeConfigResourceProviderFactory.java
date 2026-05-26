package dev.emirman.keycloak.themeconfig;

import org.keycloak.Config;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.services.resource.RealmResourceProvider;
import org.keycloak.services.resource.RealmResourceProviderFactory;

public class ThemeConfigResourceProviderFactory implements RealmResourceProviderFactory {

    public static final String ID = "theme-config";

    @Override
    public String getId() {
        return ID;
    }

    @Override
    public RealmResourceProvider create(KeycloakSession session) {
        return new ThemeConfigResourceProvider(session);
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
