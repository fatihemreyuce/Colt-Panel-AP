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
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;
