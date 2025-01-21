/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aigent-primary': '#3182CE',  // Chakra UI blue.500
        'aigent-secondary': '#718096', // Chakra UI gray.500
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'iqube': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false  // Disable Tailwind's reset styles to prevent conflicts with Chakra UI
  }
};
