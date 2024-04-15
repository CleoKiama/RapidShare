module.exports = {
  env: {
    es2021: true,
    node: true,
    browser: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  overrides: [
    {
      env: {
        node: true,
        "jest/globals": true,
      },
      files: [".eslintrc.{js,cjs}", "**/test/**"],
      plugins: ["jest"],
      extends: ["plugin:jest/recommended"],
      parserOptions: {
        sourceType: "module",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "react",
    "promise",
    "node",
    "react-hooks",
    "tailwindcss",
  ],
  rules: {
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error",
    // "no-console" : "error"
  },
};

