// @ts-check

import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";
import perfectionist from "eslint-plugin-perfectionist";
import globals from "globals";

export default defineConfig(
    {
        name: "global/ignores",
        ignores: ["**/dist/**", "**/.astro/**"],
    },
    {
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommended,
            astro.configs.recommended,
            astro.configs["jsx-a11y-recommended"],
            perfectionist.configs["recommended-natural"],
        ],
        files: ["**/*.astro", "**/*.ts", "**/*.tsx"],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
        },
        name: "global/rules",
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
        },
    },
);
