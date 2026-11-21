import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        // Credenciais vazias: nenhum teste pode inicializar o Firebase real, mesmo com .env/.env.local presentes.
        env: {
            VITE_FIREBASE_API_KEY: "",
            VITE_FIREBASE_AUTH_DOMAIN: "",
            VITE_FIREBASE_PROJECT_ID: "",
            VITE_FIREBASE_APP_ID: "",
            VITE_FIRESTORE_ENABLED: "false",
        },
        include: ["src/tests/interface/integration/**/*.test.tsx"],
        reporters: ["default", "json"],
        outputFile: { json: "coverage/interface-integration/test-results.json" },
        coverage: {
            provider: "v8",
            include: ["src/interface/**/*.{ts,tsx}"],
            exclude: ["src/interface/**/*.d.ts"],
            reportsDirectory: "coverage/interface-integration",
            reporter: ["text", "html", "json-summary", "lcov"],
        },
    },
});
