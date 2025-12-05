import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			animation: {
				'spin-slow': 'spin 3s linear infinite',
			},
			fontFamily: {
				sans: ['DM Sans', 'sans-serif'],
				display: ['Laila', 'sans-serif'],
			},
			fontSize: {
				// Display text: Bold 64/72
				'display': ['64px', { lineHeight: '72px', fontWeight: '700' }],
				// H1: SemiBold 48/56
				'h1': ['48px', { lineHeight: '56px', fontWeight: '600' }],
				// H2: SemiBold 36/44
				'h2': ['36px', { lineHeight: '44px', fontWeight: '600' }],
				// H3: SemiBold 32/40
				'h3': ['32px', { lineHeight: '40px', fontWeight: '600' }],
				// H4: SemiBold 28/36
				'h4': ['28px', { lineHeight: '36px', fontWeight: '600' }],
				// H5: SemiBold 24/32
				'h5': ['24px', { lineHeight: '32px', fontWeight: '600' }],
				// H6: SemiBold 20/30
				'h6': ['20px', { lineHeight: '30px', fontWeight: '600' }],
				// Paragraph-1: Regular 20/32
				'p1': ['20px', { lineHeight: '32px', fontWeight: '400' }],
				// Paragraph-2: Regular 20/30
				'p2': ['20px', { lineHeight: '30px', fontWeight: '400' }],
				// Paragraph-3: Regular 16/24
				'p3': ['16px', { lineHeight: '24px', fontWeight: '400' }],
			},
			fontWeight: {
				regular: '400',
				semibold: '600',
				bold: '700',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				// Expose dark palette and greys for direct utility usage
				dark: {
					10: 'hsl(var(--dark-10))',
					15: 'hsl(var(--dark-15))',
					20: 'hsl(var(--dark-20))',
					25: 'hsl(var(--dark-25))',
					30: 'hsl(var(--dark-30))',
					35: 'hsl(var(--dark-35))',
					40: 'hsl(var(--dark-40))',
				},
				grey: {
					50: 'hsl(var(--grey-50))',
					60: 'hsl(var(--grey-60))',
					70: 'hsl(var(--grey-70))',
					80: 'hsl(var(--grey-80))',
					90: 'hsl(var(--grey-90))',
					95: 'hsl(var(--grey-95))',
					97: 'hsl(var(--grey-97))',
					99: 'hsl(var(--grey-99))',
				},
				// Design system colors from the image
				brand: {
					green: '#3fbd59', // Bright green from design
					'dark-green': '#001c05', // Very dark green from design
				},
				// Yeşil renk tonları
				green: {
					50: '#f0fdf4',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#22c55e',
					600: '#16a34a',
					700: '#15803d',
					800: '#166534',
					900: '#14532d',
					950: '#052e16',
					// Design system green
					brand: '#3fbd59',
				},
				emerald: {
					50: '#ecfdf5',
					100: '#d1fae5',
					200: '#a7f3d0',
					300: '#6ee7b7',
					400: '#34d399',
					500: '#10b981',
					600: '#059669',
					700: '#047857',
					800: '#065f46',
					900: '#064e3b',
					950: '#022c22',
				},
				lime: {
					50: '#f7fee7',
					100: '#ecfccb',
					200: '#d9f99d',
					300: '#bef264',
					400: '#a3e635',
					500: '#84cc16',
					600: '#65a30d',
					700: '#4d7c0f',
					800: '#365314',
					900: '#1a2e05',
					950: '#0f1a03',
				},
				teal: {
					50: '#f0fdfa',
					100: '#ccfbf1',
					200: '#99f6e4',
					300: '#5eead4',
					400: '#2dd4bf',
					500: '#14b8a6',
					600: '#0d9488',
					700: '#0f766e',
					800: '#115e59',
					900: '#134e4a',
					950: '#042f2e',
				},
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;
