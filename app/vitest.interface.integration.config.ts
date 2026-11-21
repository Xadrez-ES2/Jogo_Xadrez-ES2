import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
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
