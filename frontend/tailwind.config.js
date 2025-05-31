import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './**/*.html',              // найдёт index.html в любом месте
    './src/**/*.{js,ts,jsx,tsx}' // найдёт весь React-код
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
