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
        legal: {
          bg: '#F9FAFB',
          card: '#FFFFFF',
          border: '#E5E7EB',
          borderSubtle: '#F3F4F6',
          textMain: '#111827',
          textMuted: '#6B7280',
          textSubtle: '#9CA3AF',
          primary: '#0F172A',
          primaryHover: '#1E293B',
          accent: '#2563EB',
          urgentBg: '#FEF2F2',
          urgentText: '#991B1B',
          urgentBorder: '#FEE2E2',
          warningBg: '#FFFBEB',
          warningText: '#92400E',
          warningBorder: '#FEF3C7',
          successBg: '#ECFDF5',
          successText: '#065F46',
          successBorder: '#D1FAE5',
          infoBg: '#EFF6FF',
          infoText: '#1E40AF',
          infoBorder: '#DBEAFE',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'elevated': '0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
