/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      maxWidth: {
        'content-narrow': 'var(--content-narrow)',
        'content-standard': 'var(--content-standard)',
        'content-wide': 'var(--content-wide)',
        'content-ultra': 'var(--content-ultra)',
      },
      screens: {
        // 2200px is the canonical `3xl` threshold — repeated in globals.css (x2)
        // and home-new.css (x2) because CSS @media can't read a custom property.
        // Never diverge; if it changes here, change it everywhere.
        '3xl': '2200px',
        '4xl': '3000px',
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
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
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: {
            DEFAULT: "hsl(var(--sidebar-primary))",
            foreground: "hsl(var(--sidebar-primary-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--sidebar-accent))",
            foreground: "hsl(var(--sidebar-accent-foreground))",
          },
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        // Routes Management Modern Colors
        "rm-primary": "#4361ee",
        "rm-primary-light": "#4895ef",
        "rm-primary-dark": "#3a0ca3",
        "rm-secondary": "#7209b7",
        "rm-accent": "#f72585",
        "rm-success": "#4cc9f0",
        "rm-success-dark": "#4361ee",
        "rm-danger": "#f72585",
        "rm-warning": "#f8961e",
        "rm-info": "#4895ef",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "rm-lg": "20px",
        "rm-md": "12px",
        "rm-sm": "8px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(14px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        fadeInRight: {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.4", transform: "translateX(-100%)" },
          "50%": { opacity: "0.8", transform: "translateX(100%)" },
        },
        fadeInRow: {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        modalSlideIn: {
          from: { opacity: "0", transform: "scale(0.9) translateY(-30px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        checkMark: {
          "0%": { transform: "scale(0) rotate(-45deg)", opacity: "0" },
          "50%": { transform: "scale(1.2) rotate(5deg)" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        rotateGlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        confettiFall: {
          "0%": { transform: "translateY(-100vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        backdropFadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        modalPopIn: {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        confettiFallRotate: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "10%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(100vh)" },
        },
        confettiRotate: {
          to: { transform: "rotate(720deg)" },
        },
        badgePop: {
          from: { transform: "translate(-50%, -50%) scale(0.85)", opacity: "0" },
          to: { transform: "translate(-50%, -50%) scale(1)", opacity: "1" },
        },
        badgeGlow: {
          "0%, 100%": { boxShadow: "0 12px 30px rgba(5,150,105,0.45), inset 0 0 20px rgba(255,255,255,0.15)" },
          "50%": { boxShadow: "0 16px 40px rgba(5,150,105,0.65), inset 0 0 26px rgba(255,255,255,0.22)" },
        },
        iconPop: {
          from: { transform: "scale(0.8)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        stroke: {
          "100%": { strokeDashoffset: "0" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.7)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        fadeInUpRoutes: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInRightRoutes: {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        fadeInRoutes: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeIn: {
          to: { opacity: "1" },
        },
        rippleAnim: {
          "0%": { opacity: "0.25", transform: "translate(-50%, -50%) scale(1)" },
          "100%": { opacity: "0", transform: "translate(-50%, -50%) scale(40)" },
        },
        dropdownFadeInDown: {
          from: { opacity: "0", transform: "translateY(-4px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        dropdownFadeOutUp: {
          from: { opacity: "1", transform: "translateY(0) scale(1)" },
          to: { opacity: "0", transform: "translateY(-4px) scale(0.98)" },
        },
        dropdownFadeInUp: {
          from: { opacity: "0", transform: "translateY(4px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        dropdownFadeOutDown: {
          from: { opacity: "1", transform: "translateY(0) scale(1)" },
          to: { opacity: "0", transform: "translateY(4px) scale(0.98)" },
        },
        modalEnter: {
          "0%": { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
          "100%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        modalExit: {
          "0%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
          "100%": { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
        },
        overlayEnter: {
          "0%": { opacity: "0", backdropFilter: "blur(0px)" },
          "100%": { opacity: "1", backdropFilter: "blur(4px)" },
        },
        overlayExit: {
          "0%": { opacity: "1", backdropFilter: "blur(4px)" },
          "100%": { opacity: "0", backdropFilter: "blur(0px)" },
        },
        scaleOut: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.95)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shadowGlow: {
          "0%, 100%": { boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" },
          "50%": { boxShadow: "0 25px 35px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.06)" },
        },
        "dropdown-open": {
          "0%": { 
            opacity: "0", 
            transform: "scale(0.95) translateY(-8px)",
            filter: "blur(4px)"
          },
          "100%": { 
            opacity: "1", 
            transform: "scale(1) translateY(0)",
            filter: "blur(0px)"
          },
        },
        "dropdown-close": {
          "0%": { 
            opacity: "1", 
            transform: "scale(1) translateY(0)",
            filter: "blur(0px)"
          },
          "100%": { 
            opacity: "0", 
            transform: "scale(0.95) translateY(-8px)",
            filter: "blur(4px)"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        slideDown: "slideDown 0.5s ease-out",
        fadeInUp: "fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        fadeInRight: "fadeInRight 0.6s ease-out",
        fadeIn: "fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        shimmer: "shimmer 3s ease-in-out infinite",
        fadeInRow: "fadeInRow 0.5s ease-out",
        modalSlideIn: "modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        bounceIn: "bounceIn 0.5s ease-out",
        scaleIn: "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "backdrop-fade-in": "backdropFadeIn 0.25s ease-out both",
        "modal-pop-in": "modalPopIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        "confetti-fall": "confettiFallRotate 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "confetti-rotate": "confettiRotate linear infinite",
        "badge-pop": "badgePop 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "badge-glow": "badgeGlow 1.2s ease-in-out 0.2s both",
        "icon-pop": "iconPop 0.4s ease-out 0.05s both",
        "scale-in-checkmark": "scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "stroke-circle": "stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards",
        "stroke-check": "stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards",
        stroke: "stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards",
        "rotate-glow": "rotateGlow 3s linear infinite",
        pulse: "pulse 2s infinite",
        bounce: "bounce 2s infinite",
        shake: "shake 0.5s ease-in-out",
        float: "float 3s ease-in-out infinite",
        "fade-in-up-routes": "fadeInUpRoutes 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in-right-routes": "fadeInRightRoutes 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both",
        "fade-in-routes": "fadeInRoutes 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both",
        "fade-in": "fadeIn 0.2s forwards",
        "ripple": "rippleAnim 0.6s ease-out forwards",
        "dropdown-fade-in-down": "dropdownFadeInDown 0.2s ease-out",
        "dropdown-fade-out-up": "dropdownFadeOutUp 0.15s ease-in",
        "dropdown-fade-in-up": "dropdownFadeInUp 0.2s ease-out",
        "dropdown-fade-out-down": "dropdownFadeOutDown 0.15s ease-in",
        "modal-enter": "modalEnter 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        "modal-exit": "modalExit 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        "overlay-enter": "overlayEnter 0.25s ease-out",
        "overlay-exit": "overlayExit 0.25s ease-out",
        "scale-out": "scaleOut 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "shadow-glow": "shadowGlow 2s ease-in-out infinite",
        "dropdown-open": "dropdown-open 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "dropdown-close": "dropdown-close 0.15s cubic-bezier(0.4, 0, 1, 1)",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities, addComponents, theme }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
      addComponents({
        '.ops-management-page': {
          fontFamily: "'Inter', sans-serif",
          position: 'relative',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 30%, #e0e7ff 60%, #f0f4f8 100%)',
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          '&::before': {
            content: '""',
            position: 'fixed',
            inset: '0',
            background: 'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.12), transparent 50%), radial-gradient(circle at 80% 10%, rgba(236, 72, 153, 0.12), transparent 45%), radial-gradient(circle at 75% 80%, rgba(14, 165, 233, 0.12), transparent 50%)',
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            zIndex: '-1',
          },
        },
        '.ops-container': {
          backgroundColor: 'transparent',
        },
        '.page-title': {
          background: 'linear-gradient(135deg, var(--text-dark) 0%, var(--primary-blue) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        '.date-badge': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'white',
          padding: '8px 16px',
          borderRadius: '100px',
          fontWeight: '600',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: '0.5rem',
        },
        '.profile-pill': {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          padding: '6px 8px 6px 20px',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          textDecoration: 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            boxShadow: '0 6px 12px -1px rgb(0 0 0 / 0.15), 0 4px 6px -2px rgb(0 0 0 / 0.1), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          },
        },
        '.navbar-header': {
          display: 'flex',
          height: '4rem',
          flexShrink: '0',
          alignItems: 'center',
          gap: '0.5rem',
          position: 'relative',
          zIndex: '50',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          borderTop: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 1px 0 0 rgba(255, 255, 255, 0.5) inset, 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.2) 20%, rgba(236, 72, 153, 0.2) 50%, rgba(14, 165, 233, 0.2) 80%, transparent 100%)',
            opacity: '0.6',
            animation: 'shimmer 3s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(226, 232, 240, 0.6) 50%, transparent 100%)',
          },
          '&:hover': {
            boxShadow: '0 1px 0 0 rgba(255, 255, 255, 0.6) inset, 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.03)',
            borderBottomColor: 'rgba(226, 232, 240, 0.9)',
          },
        },
      });
    },
  ],
} 
