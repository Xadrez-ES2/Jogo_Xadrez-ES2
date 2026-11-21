import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        // As suítes versionadas ficam aqui; app/tests contém testes locais antigos.
        include: ["src/tests/**/*.test.{ts,tsx}"],
        exclude: ["src/tests/interface/system/**"],
        // Credenciais vazias: a regressão nunca inicializa o Firebase real, mesmo com .env/.env.local presentes.
        env: {
            VITE_FIREBASE_API_KEY: "",
            VITE_FIREBASE_AUTH_DOMAIN: "",
            VITE_FIREBASE_PROJECT_ID: "",
            VITE_FIREBASE_APP_ID: "",
            VITE_FIRESTORE_ENABLED: "false",
        },
    },
});
