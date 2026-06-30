import { defineConfig, configDefaults } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./vitest.setup.ts"],
        // Unit tests only. Exclude Playwright/Cypress E2E suites — they import
        // @playwright/test and crash under vitest's collector.
        exclude: [
            ...configDefaults.exclude,
            "tests/prod/**",
            "cypress/**",
            "playwright-report/**",
            "test-results/**",
        ],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
});
