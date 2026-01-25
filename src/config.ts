/**
 * Keycloak theme configuration
 * 
 * You can customize the theme name in this file.
 * The theme name will be used in the names of the generated JAR files.
 */

export const keycloakThemeConfig = {
    /**
     * Theme name
     * Examples: "keycloak-shadcn", "my-custom-theme", "company-theme", etc.
     */
    themeName: "keycloak-shadcn",
} as const;

/**
 * Generates JAR file names for Keycloak version targets
 */
export function getKeycloakVersionTargets() {
    const { themeName } = keycloakThemeConfig;

    return {
        "26.2-and-above": `${themeName}-26.2-and-above.jar`,
        "26.0-to-26.1": `${themeName}-26.0-to-26.1.jar`,
        "25": `${themeName}-25.jar`,
        "24": `${themeName}-24.jar`,
        "23": `${themeName}-23.jar`,
        "21-and-below": `${themeName}-21-and-below.jar`,
    };
}

