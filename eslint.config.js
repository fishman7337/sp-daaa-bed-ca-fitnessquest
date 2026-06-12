const security = require("eslint-plugin-security");
const prettier = require("eslint-config-prettier");

const commonGlobals = {
  console: "readonly",
  process: "readonly",
  Buffer: "readonly",
  __dirname: "readonly",
  module: "readonly",
  require: "readonly",
};

const browserGlobals = {
  document: "readonly",
  event: "readonly",
  fetch: "readonly",
  FormData: "readonly",
  localStorage: "readonly",
  window: "readonly",
};

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      ".dist/**",
      "public/assets/**",
    ],
  },
  {
    files: [
      "src/**/*.js",
      "scripts/**/*.js",
      "tests/**/*.js",
      "index.js",
      "*.js",
    ],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "commonjs",
      globals: commonGlobals,
    },
    plugins: {
      security,
    },
    rules: {
      ...security.configs.recommended.rules,
      "no-console": "off",
      "security/detect-object-injection": "off",
    },
  },
  {
    files: ["public/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: browserGlobals,
    },
    rules: {
      "no-console": "warn",
    },
  },
  prettier,
];
