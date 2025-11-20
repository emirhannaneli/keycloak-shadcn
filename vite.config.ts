import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        keycloakify({
            accountThemeImplementation: "Multi-Page",
            artifactId: "keycloak-shadcn",
            keycloakVersionTargets: {
                "26.2-and-above": "keycloak-shadcn-26.2-and-above.jar",
                "26.0-to-26.1": "keycloak-shadcn-26.0-to-26.1.jar",
                "25": "keycloak-shadcn-25.jar",
                "24": "keycloak-shadcn-24.jar",
                "23": "keycloak-shadcn-23.jar",
                "21-and-below": "keycloak-shadcn-21-and-below.jar",
            }
        })
    ],
    resolve: {
        alias: [
            {
                find: "@",
                replacement: path.resolve(__dirname, "./src"),
            },
        ],
    },
});
