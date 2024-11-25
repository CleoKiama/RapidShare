/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/renderer/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/renderer/components/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#e6f1fe",
					100: "#cce3fd",
					500: "#3b82f6",
					600: "#2563eb",
					700: "#1d4ed8",
				},
				grey: {
					50: "#F7F7F7",
					100: "#E1E1E1",
					200: "#CFCFCF",
					300: "#B1B1B1",
					400: "#9E9E9E",
					500: "#7E7E7E",
					600: "#626262",
					700: "#515151",
					800: "#3B3B3B",
					900: "#222222",
				},
				error: {
					100: "#fee2e2",
					700: "#b91c1c",
				},
			},
		},
	},
	plugins: [],
};
