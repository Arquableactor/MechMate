import config from "@repo/config/eslint";

export default [
  ...config,
  {
    // Helpers de test en CommonJS (jest globalSetup/teardown corren en Node puro).
    files: ["**/*.js", "**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "writable",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        console: "readonly",
        globalThis: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
