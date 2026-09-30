import config from "@repo/config/eslint";

export default [
  ...config,
  {
    // Script de build en CommonJS (genera dist/api-schemas.json; corre en Node puro).
    files: ["scripts/**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        __dirname: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
