/** @type {import('tailwindcss').Config} */

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				// Cada cor lê de uma CSS Custom Property definida pelo ThemeProvider.
				// Isso permite trocar o tema inteiro em runtime sem recompilar o CSS.
				background: "var(--color-background)",
				surface: "var(--color-surface)",
				"surface-alt": "var(--color-surface-alt)",
				primary: {
				DEFAULT: "var(--color-primary)",
				hover: "var(--color-primary-hover)",
				},
				accent: "var(--color-accent)",
				"text-primary": "var(--color-text-primary)",
				"text-muted": "var(--color-text-muted)",
				border: "var(--color-border)",
				"board-light": "var(--color-board-light)",
				"board-dark": "var(--color-board-dark)",
				success: "var(--color-success)",
				danger: "var(--color-danger)",
			},
			fontFamily: {
				display: ["Fraunces", "ui-serif", "Georgia", "serif"],
				body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
				mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
			},
			backgroundImage: {
				"board-pattern":
				"linear-gradient(45deg, var(--color-board-dark) 25%, transparent 25%), linear-gradient(-45deg, var(--color-board-dark) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--color-board-dark) 75%), linear-gradient(-45deg, transparent 75%, var(--color-board-dark) 75%)",
			},
			backgroundSize: {
				board: "64px 64px",
			},
			keyframes: {
				"fade-up": {
				"0%": { opacity: "0", transform: "translateY(12px)" },
				"100%": { opacity: "1", transform: "translateY(0)" },
				},
			},
			animation: {
				"fade-up": "fade-up 0.6s ease-out forwards",
			},
		},
	},
	plugins: [],
};
