/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ASEPS Academic Light Palette
        // Primary: Deep Federal Blue (ABS/government aesthetic)
        federal: {
          50:  '#eef3f9',
          100: '#d4e2f0',
          200: '#aac5e1',
          300: '#7aa3cc',
          400: '#4f81b5',
          500: '#2d629e',
          600: '#1a3557', // Primary brand
          700: '#162d4a',
          800: '#12253d',
          900: '#0d1c2e',
        },
        // Accent: Ochre/Gold (Australian earth tones)
        ochre: {
          50:  '#fdf8ec',
          100: '#faeecc',
          200: '#f5da96',
          300: '#efc160',
          400: '#e8a832',
          500: '#c98a18',
          600: '#a06c12',
          700: '#7a520e',
          800: '#543a0a',
          900: '#2e2006',
        },
        // Semantic severity colours
        severity: {
          critical: '#b91c1c',  // Red-700
          high: '#c2410c',      // Orange-700
          medium: '#b45309',    // Amber-700
          low: '#15803d',       // Green-700
        },
        // Parchment backgrounds (academic paper feel)
        parchment: {
          50:  '#fafaf8',
          100: '#f5f4f0',
          200: '#eceae3',
          300: '#dedad0',
          400: '#ccc7b8',
          500: '#b5af9d',
        }
      },
      fontFamily: {
        // Display: Playfair Display for academic gravitas
        display: ['Playfair Display', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        // Body: Source Serif Pro for readability
        body: ['Source Serif 4', 'Georgia', 'Cambria', 'serif'],
        // Mono: JetBrains for data/code
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        // Sans: Instrument Sans for UI elements
        sans: ['Instrument Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-md': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      boxShadow: {
        'academic': '0 1px 3px rgba(26, 53, 87, 0.08), 0 1px 2px rgba(26, 53, 87, 0.06)',
        'academic-md': '0 4px 6px rgba(26, 53, 87, 0.07), 0 2px 4px rgba(26, 53, 87, 0.06)',
        'academic-lg': '0 10px 15px rgba(26, 53, 87, 0.1), 0 4px 6px rgba(26, 53, 87, 0.07)',
      },
      borderRadius: {
        'academic': '2px', // Sharp corners — academic document feel
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
