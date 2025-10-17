const createFormatter = (locale = "en") =>
	new Intl.NumberFormat(locale, {
		notation: "compact",
		maximumFractionDigits: 1,
		compactDisplay: "short",
	});

const defaultFormatter = createFormatter();

export const formatCompactNumber = (
	number: number,
	threshold = 1000,
	locale?: string,
) => {
	if (!Number.isFinite(number)) {
		return "";
	}
	if (Math.abs(number) < threshold) {
		return number.toString();
	}
	return (locale ? createFormatter(locale) : defaultFormatter).format(number);
};
