module.exports = {
	darkMode: ['class'],
	content: [
	  './pages/**/*.{js,ts,jsx,tsx}',
	  './components/**/*.{js,ts,jsx,tsx}',
	],
	safelist: [
	  // Status Colors
	  'bg-yellow-100',
	  'text-yellow-800',
	  'bg-blue-100',
	  'text-blue-800',
	  'bg-green-100',
	  'text-green-800',
	  'bg-red-100',
	  'text-red-800',
	  'bg-purple-100',
	  'text-purple-800',
	  'bg-gray-100',
	  'text-gray-800',
	  // Priority Colors
	  'bg-red-100',
	  'text-red-800',
	  'bg-yellow-100',
	  'text-yellow-800',
	  'bg-green-100',
	  'text-green-800',
	  // Person Colors
	  'bg-red-100', 'text-red-800',
	  'bg-orange-100', 'text-orange-800',
	  'bg-amber-100', 'text-amber-800',
	  'bg-yellow-100', 'text-yellow-800',
	  'bg-lime-100', 'text-lime-800',
	  'bg-green-100', 'text-green-800',
	  'bg-emerald-100', 'text-emerald-800',
	  'bg-teal-100', 'text-teal-800',
	  'bg-cyan-100', 'text-cyan-800',
	  'bg-sky-100', 'text-sky-800',
	  'bg-blue-100', 'text-blue-800',
	  'bg-indigo-100', 'text-indigo-800',
	  'bg-violet-100', 'text-violet-800',
	  'bg-purple-100', 'text-purple-800',
	  'bg-pink-100', 'text-pink-800',
	  'bg-rose-100', 'text-rose-800',
	],
	theme: {
	  extend: {
		borderRadius: {
		  lg: 'var(--radius)',
		  md: 'calc(var(--radius) - 2px)',
		  sm: 'calc(var(--radius) - 4px)',
		},
		colors: {
		  background: 'hsl(var(--background))',
		  foreground: 'hsl(var(--foreground))',
		  card: {
			DEFAULT: 'hsl(var(--card))',
			foreground: 'hsl(var(--card-foreground))',
		  },
		  popover: {
			DEFAULT: 'hsl(var(--popover))',
			foreground: 'hsl(var(--popover-foreground))',
		  },
		  primary: {
			DEFAULT: 'hsl(var(--primary))',
			foreground: 'hsl(var(--primary-foreground))',
		  },
		  secondary: {
			DEFAULT: 'hsl(var(--secondary))',
			foreground: 'hsl(var(--secondary-foreground))',
		  },
		  muted: {
			DEFAULT: 'hsl(var(--muted))',
			foreground: 'hsl(var(--muted-foreground))',
		  },
		  accent: {
			DEFAULT: 'hsl(var(--accent))',
			foreground: 'hsl(var(--accent-foreground))',
		  },
		  destructive: {
			DEFAULT: 'hsl(var(--destructive))',
			foreground: 'hsl(var(--destructive-foreground))',
		  },
		  border: 'hsl(var(--border))',
		  input: 'hsl(var(--input))',
		  ring: 'hsl(var(--ring))',
		  chart: {
			'1': 'hsl(var(--chart-1))',
			'2': 'hsl(var(--chart-2))',
			'3': 'hsl(var(--chart-3))',
			'4': 'hsl(var(--chart-4))',
			'5': 'hsl(var(--chart-5))',
		  },
		},
	  },
	},
	plugins: [require('tailwindcss-animate')],
  };
  