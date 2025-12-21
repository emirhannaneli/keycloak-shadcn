/**
 * Keycloak tema yapılandırması
 * 
 * Bu dosyada tema adını özelleştirebilirsiniz.
 * Tema adı, oluşturulacak JAR dosyalarının isimlerinde kullanılacaktır.
 */

export const keycloakThemeConfig = {
    /**
     * Tema adı
     * Örnek: "keycloak-shadcn", "my-custom-theme", "company-theme" vb.
     */
    themeName: "keycloak-shadcn",
} as const;

/**
 * Keycloak versiyon hedefleri için JAR dosya isimlerini oluşturur
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

