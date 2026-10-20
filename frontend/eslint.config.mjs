import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import-x";
import promise from "eslint-plugin-promise";
import globals from "globals";
import tseslint from "typescript-eslint";

const typedTypeScriptConfigs = tseslint.configs.recommendedTypeChecked.map(
  (configuration) => ({
    ...configuration,
    files: ["**/*.ts"],
  }),
);

export default tseslint.config(
  {
    ignores: ["apps/miniapp/dist/", "coverage/", "node_modules/", "prototype/"],
  },
  eslint.configs.recommended,
  ...typedTypeScriptConfigs,
  promise.configs["flat/recommended"],
  {
    files: ["**/*.{cjs,mjs}"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: [
          "./tsconfig.app.json",
          "./tsconfig.test.json",
          "./tsconfig.build.json",
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      complexity: ["error", 12],
      "import/no-cycle": "error",
      "max-depth": ["error", 3],
      "max-lines": [
        "error",
        { max: 500, skipBlankLines: true, skipComments: false },
      ],
      "max-lines-per-function": [
        "error",
        { IIFEs: true, max: 80, skipBlankLines: true, skipComments: false },
      ],
      "max-params": ["error", 4],
      "no-nested-ternary": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
);
