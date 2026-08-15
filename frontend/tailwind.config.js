/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'hsl(220, 13%, 9%)',
          secondary: 'hsl(220, 12%, 12%)',
          tertiary: 'hsl(220, 11%, 16%)',
          elevated: 'hsl(220, 10%, 20%)',
        },
        'border-subtle': 'hsl(220, 10%, 22%)',
        'border-default': 'hsl(220, 10%, 28%)',
        'border-strong': 'hsl(220, 10%, 40%)',
        'text-primary': 'hsl(220, 15%, 92%)',
        'text-secondary': 'hsl(220, 10%, 65%)',
        'text-muted': 'hsl(220, 8%, 45%)',
        accent: {
          blue: 'hsl(212, 100%, 60%)',
          'blue-dim': 'hsl(212, 80%, 45%)',
          purple: 'hsl(258, 90%, 66%)',
          green: 'hsl(142, 71%, 52%)',
          amber: 'hsl(38, 95%, 58%)',
          red: 'hsl(4, 90%, 60%)',
          cyan: 'hsl(188, 90%, 58%)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-in-left': 'slideInLeft 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideInLeft: { from: { transform: 'translateX(-8px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        slideInRight: { from: { transform: 'translateX(8px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
