const SEARCH_PARAM = "q";

export const getSearchParamsFromUrl = (url: URL) => {
	const searchParams = new URLSearchParams(url.search);
	const params: Record<string, string> = {};

	for (const [key, value] of searchParams.entries()) {
		if (key === SEARCH_PARAM) {
			params.search = value;
		}
	}
	return params;
};
