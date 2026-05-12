/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EAEAF0', // Text Primary
          foreground: '#0B0A14',
          dark: '#EAEAF0',
        },
        secondary: {
          DEFAULT: '#A1A1B5', // Text Secondary
          foreground: '#EAEAF0',
        },
        accent: {
          DEFAULT: '#FF9933', // Saffron
          dark: '#E88B2E',
          foreground: '#FFFFFF',
        },
        sindoor: {
          DEFAULT: '#FF5757', // Like icons
        },
        indigo: {
          DEFAULT: '#7B2FFF', // Glows and brand highlights
        },
        premium: {
          DEFAULT: '#D4AF37', // Gold 
        },
        border: '#2A2850', // Cards borders
        background: {
          light: '#0B0A14', // Force Dark Mode
          dark: '#0B0A14',
        },
        card: {
          light: '#16152A',
          dark: '#16152A',
        },
        neutral: {
          DEFAULT: '#16152A',
          foreground: '#EAEAF0',
          muted: '#A1A1B5', 
        },
        foreground: '#EAEAF0',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF9933, #C850C0, #7B2FFF)', // Saffron -> Pink -> Indigo
        'gradient-accent': 'linear-gradient(135deg, #FF9933, #C850C0)', // Saffron -> Pink
        'gradient-festival': 'linear-gradient(45deg, #FF9933, #E1306C, #833AB4)',
        'gradient-story': 'linear-gradient(135deg, #FF9933, #C850C0, #7B2FFF)',
      },
      boxShadow: {
        'depth': '0 10px 30px rgba(0,0,0,0.4)',
        'glow': '0 0 20px rgba(123, 47, 255, 0.25)',
        'glow-saffron': '0 0 20px rgba(255, 153, 51, 0.25)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "heart-beat": {
          '0%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.3)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.3)' },
          '70%': { transform: 'scale(1)' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "heart-beat": "heart-beat 0.8s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
