import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#7C3AED",
          600: "#9333EA",
          700: "#5B1AA6",
          800: "#3B0F6F",
          900: "#2D0B59",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "#FFF1F8",
          100: "#FFE4F3",
          200: "#FFCCE8",
          300: "#FF99D1",
          400: "#FF66BA",
          500: "#FF4DA6",
          600: "#FF3396",
          700: "#E6007A",
          800: "#B30060",
          900: "#800046",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Status colors
        success: {
          DEFAULT: "hsl(var(--status-success))",
          light: "hsl(142 76% 95%)",
        },
        warning: {
          DEFAULT: "hsl(var(--status-warning))",
          light: "hsl(38 92% 95%)",
        },
        error: {
          DEFAULT: "hsl(var(--status-error))",
          light: "hsl(0 84% 95%)",
        },
        info: {
          DEFAULT: "hsl(var(--status-info))",
          light: "hsl(199 89% 95%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
        'primary': '0 4px 12px rgba(255, 77, 166, 0.15)',
        'accent': '0 4px 20px rgba(255, 77, 166, 0.35)',
        'glow': '0 0 0 3px rgba(255, 77, 166, 0.15)',
        'purple': '0 8px 24px rgba(124, 58, 237, 0.2)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #9333EA 0%, #5B1AA6 100%)',
        'gradient-header': 'linear-gradient(135deg, #1e1b4b 0%, #3B0F6F 50%, #5B1AA6 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(91, 26, 166, 0.05) 100%)',
        'gradient-radial': 'radial-gradient(circle at top right, rgba(255, 77, 166, 0.35), transparent 60%)',
        'gradient-hero-purple': 'linear-gradient(135deg, #2D0B59 0%, #3B0F6F 50%, #5B1AA6 100%)',
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
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fadeIn": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;