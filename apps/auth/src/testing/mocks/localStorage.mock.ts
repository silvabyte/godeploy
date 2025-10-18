// Mock localStorage

import { mock } from "bun:test";

export const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: mock((key: string) => store[key] || null),
		setItem: mock((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: mock((key: string) => {
			delete store[key];
		}),
		clear: mock(() => {
			store = {};
		}),
	};
})();
