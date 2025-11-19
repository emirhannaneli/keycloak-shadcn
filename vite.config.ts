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
            accountThemeImplementation: "none",
            artifactId: "keycloak-shadcn",
            keycloakVersionTargets: {
                "22-to-25": "keycloak-shadcn-22-to-25.jar",
                "all-other-versions": "keycloak-shadcn-all-other-versions.jar"
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
