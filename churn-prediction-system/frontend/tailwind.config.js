/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5", // Indigo 600
          hover: "#4338ca",
        },
        secondary: "#0ea5e9", // Sky 500
        slate: {
          850: "#1e293b", // Custom deep slate
          900: "#0f172a",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(79, 70, 229, 0.15)',
      }
    },
  },
  plugins: [],
}
