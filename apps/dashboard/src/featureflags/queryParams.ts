import { FLAGS } from "./ff";

type FlagValue = (typeof FLAGS)[keyof typeof FLAGS];

const PARAM_NAME = "ff";

/**
 * Get enabled flags from URL query parameters
 * Example: ?ff=1,2 enables ENABLE_OFFER and ENABLE_SUBSCRIPTIONS
 * Example: ?ff=-1 disables ENABLE_OFFER
 */
export function getFlagsFromQuery(): number {
	const params = new URLSearchParams(window.location.search);
	const ffParam = params.get(PARAM_NAME) || params.get("-ff");

	if (!ffParam) {
		return 0;
	}

	const flags = ffParam
		.split(",")
		.map(Number)
		.filter(
			(n): n is FlagValue =>
				!Number.isNaN(n) &&
				Object.values(FLAGS).includes(Math.abs(n) as FlagValue),
		);

	// If any flag is negative or if we used -ff parameter, return the negative sum of all flags
	if (flags.some((f) => f < 0) || params.has("-ff")) {
		return -flags.reduce((acc, curr) => acc + Math.abs(curr), 0);
	}

	// Otherwise return the positive sum
	return flags.reduce((acc, curr) => acc + curr, 0);
}

/**
 * Get a human-readable list of enabled flags from query parameters
 */
export function getEnabledFlagNames(): string[] {
	const flags = getFlagsFromQuery();
	return Object.entries(FLAGS)
		.filter(([, value]) => (flags & value) !== 0)
		.map(([key]) => key);
}
