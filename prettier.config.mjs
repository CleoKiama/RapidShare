// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/** @type {import("prettier").Config} */
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  trailingComma: "es5",
  tabWidth: 4,
  semi: false,
  singleQuote: true,
  printWidth: 80, // Add this line
};

export default config;

