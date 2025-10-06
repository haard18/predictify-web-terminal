/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'inconsolata': ['Inconsolata', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Roboto Mono', 'Segoe UI Mono', 'Helvetica Neue', 'monospace'],
      },
      colors: {
        primary: '#1A1C1B',
        secondary: '#2A2e2e',
        accent: '#00DF82',
        yes: '#21DF00',
        no: '#BE1010',
      },
    },
  },
  plugins: [],
}