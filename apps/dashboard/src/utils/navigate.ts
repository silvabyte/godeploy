export const pushQueryParam = (param: string, value: string) => {
	const url = new URL(window.location.href);
	const existingParams = new URLSearchParams(url.search);
	existingParams.set(param, value);
	return `${url.pathname}?${existingParams.toString()}`;
};

export const popQueryParam = (param: string) => {
	const url = new URL(window.location.href);
	const existingParams = new URLSearchParams(url.search);
	existingParams.delete(param);
	return `${url.pathname}?${existingParams.toString()}`;
};

// Removed unused helper to satisfy TS noUnusedLocals
