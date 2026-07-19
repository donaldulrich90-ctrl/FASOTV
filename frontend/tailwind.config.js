/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#06060C",
        surface: "#0E0E18",
        card: "#161625",
        "card-hover": "#1E1E32",
        gold: "#F5A623",
        "gold-dark": "#D4891C",
        live: "#E54B4B",
        success: "#2DD4A8",
        premium: "#9333EA",
        border: "#2A2A40",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        btn: "10px",
        badge: "6px",
      },
      animation: {
        pulse_live: "pulse_live 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        pulse_live: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
