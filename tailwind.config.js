/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: '#1E1E1E',
        primary: '#6366F1',
        accent: '#FBBF24',
        border: '#2C2C2C',
        foreground: '#E5E7EB',
        muted: '#9CA3AF',
        danger: '#EF4444',
        success: '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

