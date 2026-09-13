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
]);

export default eslintConfig;
