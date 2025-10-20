import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		port: 35173,
	},
	//@ts-expect-error - this is fine
	test: {
		pool: "forks",
		poolOptions: {
			forks: {
				singleFork: true,
			},
		},
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
