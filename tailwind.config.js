/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brick and Beam Color Palette - Dark Blue & Golden
        'dark-blue': {
          50: '#e6eaf5',
          100: '#b3c0e0',
          200: '#8096cb',
          300: '#4d6cb6',
          400: '#1a42a1',
          500: '#0d2d7a', // Primary dark blue
          600: '#0a2362',
          700: '#07194a',
          800: '#040f32', // Deep dark blue (logo background)
          900: '#02051a',
        },
        golden: {
          50: '#fffef5',
          100: '#fff9d9',
          200: '#fff4bd',
          300: '#ffefa1',
          400: '#ffea85',
          500: '#d4af37', // Primary golden
          600: '#b8941f',
          700: '#9c7a07',
          800: '#806000',
          900: '#644600',
        },
        // Keep legacy colors for compatibility
        ocean: {
          50: '#e6eaf5',
          100: '#b3c0e0',
          200: '#8096cb',
          300: '#4d6cb6',
          400: '#1a42a1',
          500: '#0d2d7a',
          600: '#0a2362',
          700: '#07194a',
          800: '#040f32', // Dark blue
          900: '#02051a',
        },
        forest: {
          50: '#fffef5',
          100: '#fff9d9',
          200: '#fff4bd',
          300: '#ffefa1',
          400: '#ffea85',
          500: '#d4af37', // Golden
          600: '#b8941f',
          700: '#9c7a07',
          800: '#806000',
          900: '#644600',
        },
        'cream-beige': '#f5f5dc',
        sage: '#9ca3af',
        terracotta: '#d97706',
        nature: '#059669',
        'light-gray': '#f8f9fa',
        'dark-gray': '#343a40',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-luxury': 'linear-gradient(135deg, #0d2d7a 0%, #d4af37 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #0d2d7a 0%, #1a42a1 100%)',
        'gradient-forest': 'linear-gradient(135deg, #d4af37 0%, #ffea85 100%)',
        'gradient-golden': 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
      },
      boxShadow: {
        'luxury': '0 10px 30px rgba(0,0,0,0.1)',
        'luxury-lg': '0 20px 40px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 