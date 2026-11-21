import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
    plugins: [react()],
    envPrefix: "VITEST_SYSTEM_",
    // Exercita o frontend completo como visitante, sem acessar serviços remotos.
    define: {
        "import.meta.env.VITE_FIREBASE_API_KEY": JSON.stringify(""),
        "import.meta.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(""),
        "import.meta.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(""),
        "import.meta.env.VITE_FIREBASE_APP_ID": JSON.stringify(""),
        "import.meta.env.VITE_FIRESTORE_ENABLED": JSON.stringify("false"),
    },
    test: {
        include: ["src/tests/interface/system/**/*.system.test.tsx"],
        testTimeout: 20000,
        reporters: ["default", "json"],
        outputFile: { json: "coverage/interface-system/test-results.json" },
        coverage: {
            provider: "v8",
            include: ["src/interface/**/*.{ts,tsx}"],
            exclude: ["src/interface/**/*.d.ts"],
            reportsDirectory: "coverage/interface-system",
            reporter: ["text", "html", "json-summary", "lcov"],
        },
        browser: {
            enabled: true,
            headless: true,
            provider: playwright({ actionTimeout: 5000 }),
            instances: [{ browser: "chromium", viewport: { width: 1280, height: 900 } }],
        },
    },
});
