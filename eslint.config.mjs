import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Handoff de design: os protótipos são referência, não código do app.
    // `BottomNav.tsx` importa react-router-dom, que este projeto não usa.
    "docs/design/**",
  ]),
  {
    rules: {
      // O projeto já nomeia com `_` o parâmetro que existe só para casar com
      // uma assinatura de fora — `_anterior` das Server Actions, que o
      // `useActionState` exige e a ação não lê. A regra só não reclamava por
      // acaso: o padrão dela é avisar apenas sobre o **último** argumento não
      // usado, então a mesma convenção passava numa ação e reprovava na
      // seguinte, conforme houvesse um `formData` depois. Aqui a convenção
      // vira regra.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]);

export default eslintConfig;
