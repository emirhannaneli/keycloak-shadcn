import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [],
    framework: {
        name: "@storybook/react-vite",
        options: {}
    },
    staticDirs: ["../public"],
    async viteFinal(config) {
        return mergeConfig(config, {
            resolve: {
                alias: {
                    "@": path.resolve(__dirname, "../src"),
                },
            },
            optimizeDeps: {
                include: [
                    "keycloakify/account/UserProfileFormFields",
                    "keycloakify/account/DefaultPage",
                    "keycloakify/account/Template",
                    "react",
                    "react-dom"
                ],
                exclude: [],
            },
            build: {
                commonjsOptions: {
                    include: [/keycloakify/, /node_modules/],
                },
            },
            server: {
                fs: {
                    allow: [".."],
                },
            },
        });
    }
};
export default config;
