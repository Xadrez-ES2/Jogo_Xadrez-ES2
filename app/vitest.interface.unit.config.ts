import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        include: ["src/tests/interface/unit/**/*.test.{ts,tsx}"],
        reporters: ["default", "json"],
        outputFile: { json: "coverage/interface-unit/test-results.json" },
        coverage: {
            provider: "v8",
            // Inclui também arquivos não exercitados, sem inflar a cobertura.
            include: ["src/interface/**/*.{ts,tsx}"],
            exclude: ["src/interface/**/*.d.ts"],
            reportsDirectory: "coverage/interface-unit",
            reporter: ["text", "html", "json-summary", "lcov"],
        },
    },
});
