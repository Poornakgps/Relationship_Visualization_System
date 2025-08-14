/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for graph visualization
        'graph': {
          'user': '#3B82F6',      // Blue for user nodes
          'transaction': '#10B981', // Green for transaction nodes
          'email': '#EF4444',      // Red for email relationships
          'phone': '#F59E0B',      // Orange for phone relationships
          'address': '#8B5CF6',    // Purple for address relationships
          'device': '#EC4899',     // Pink for device relationships
          'ip': '#6366F1',         // Indigo for IP relationships
          'payment': '#14B8A6',    // Teal for payment method relationships
        },
        'sidebar': {
          'bg': '#F8FAFC',
          'border': '#E2E8F0',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
} 