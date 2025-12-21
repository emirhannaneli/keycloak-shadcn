import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import path from "path";
import { fileURLToPath } from "url";
import { keycloakThemeConfig, getKeycloakVersionTargets } from "./src/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        keycloakify({
            accountThemeImplementation: "Multi-Page",
            artifactId: keycloakThemeConfig.themeName,
            keycloakVersionTargets: getKeycloakVersionTargets(),
        })
    ],
    resolve: {
        alias: [
            {
                find: "@",
                replacement: path.resolve(__dirname, "./src"),
            },
            {
                find: "config",
                replacement: path.resolve(__dirname, "./src/config.ts"),
            },
        ],
    },
});
