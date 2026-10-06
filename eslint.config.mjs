import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  {
    ignores: [
      ".next/**", ".next-dev/**", ".worktrees/**", "Logix-new-front/**",
      "node_modules/**", "public/**", "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    // Screens exported from Figma, not written here. They use <img> because the
    // exporter emits <img>, and 704 warnings nobody can act on were burying the
    // dozen that are actually ours. Reimporting a screen regenerates the file,
    // so editing them to satisfy the rule would not last the week.
    files: ["src/features/*/design/**/*.{ts,tsx}"],
    rules: { "@next/next/no-img-element": "off" },
  },
];

export default config;
