import type { Order } from "../services/BaseService";

export const getSortFromSearchParams = (
	url: URL,
	sortParams: Record<string, string>,
	defaultSort: string,
	defaultOrder: string,
) => {
	const searchParams = new URLSearchParams(url.search);
	let sortField: string = defaultSort;
	let sortOrder: string = defaultOrder;

	for (const [key, value] of searchParams.entries()) {
		if (sortParams[key]) {
			sortField = key.split("[")[1].split("]")[0];
			sortOrder = value;
		}
	}
	return { sortField, sortOrder: sortOrder as Order };
};
