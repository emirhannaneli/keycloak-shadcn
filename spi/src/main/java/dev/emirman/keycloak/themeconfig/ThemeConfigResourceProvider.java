package dev.emirman.keycloak.themeconfig;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.services.resource.RealmResourceProvider;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Public REST endpoint that exposes a realm's <code>theme.*</code> attributes
 * to the unauthenticated login page.
 *
 * <p><strong>Security boundary:</strong> only attributes whose key starts with
 * the <code>theme.</code> prefix are returned. The endpoint is intentionally
 * unauthenticated so the login page can call it before the user has a session.
 * <strong>Do not store secrets, tokens, or sensitive realm config under keys
 * that start with {@code theme.}</strong> — they will be visible to anyone who
 * can reach the realm's login page.</p>
 */
public class ThemeConfigResourceProvider implements RealmResourceProvider {

    private static final String PREFIX = "theme.";
    private final KeycloakSession session;

    public ThemeConfigResourceProvider(KeycloakSession session) {
        this.session = session;
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getThemeConfig() {
        RealmModel realm = session.getContext().getRealm();
        if (realm == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        Map<String, String> attrs = realm.getAttributes();
        if (attrs == null) {
            return Response
                    .ok(Map.of())
                    .header("Cache-Control", "private, max-age=300")
                    .build();
        }

        Map<String, String> filtered = attrs.entrySet().stream()
                .filter(e -> e.getKey() != null && e.getKey().startsWith(PREFIX))
                .filter(e -> e.getKey().length() > PREFIX.length())
                .filter(e -> e.getValue() != null && !e.getValue().isEmpty())
                .collect(Collectors.toMap(
                        e -> e.getKey().substring(PREFIX.length()),
                        Map.Entry::getValue
                ));

        return Response
                .ok(filtered)
                .header("Cache-Control", "private, max-age=300")
                .build();
    }

    @Override
    public Object getResource() {
        return this;
    }

    @Override
    public void close() {
    }
}
