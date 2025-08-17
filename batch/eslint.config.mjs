import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  // ファイル除外設定（最初に配置）
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**", 
      "build/**",
      "dist/**",
      "coverage/**",
      ".git/**",
      // Prisma関連の除外
      "**/prisma/generated/**",
      "**/.prisma/**", 
      "**/generated/**",
      // その他の生成ファイル
      "**/*.d.ts",
      "**/migrations/**",
      // 設定ファイルの除外
      "*.config.*",
      "eslint.config.mjs",
      "postcss.config.mjs", 
      "prettier.config.js",
    ],
  },

  // ESLintの推奨ルール
  js.configs.recommended,

  // TypeScriptの推奨ルール（正しい記述）
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: { 
        ...globals.browser, 
        ...globals.node 
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { 
          jsx: true 
        },
        project: true, // TypeScriptプロジェクト設定を使用
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // 基本的なルール
      "no-unused-vars": "off", // TypeScriptルールを使用するため無効化
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "warn",
      
      // TypeScriptルール
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-use-before-define": "warn",
    },
  },
];