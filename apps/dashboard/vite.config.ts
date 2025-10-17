import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		port: 35174,
	},
	build: {
		assetsInlineLimit: (filePath) => !filePath.includes("locales"),
		rollupOptions: {
			output: {
				assetFileNames: "assets/[name].[hash].[ext]",
			},
		},
	},

	//@ts-expect-error - this is fine
	test: {
		globals: true,
		environment: "jsdom",
		include: [
			"./src/**/*.spec.ts",
			"./src/**/*.spec.tsx",
			"./src/**/*.test.ts",
			"./src/**/*.test.tsx",
		],
	},
});
