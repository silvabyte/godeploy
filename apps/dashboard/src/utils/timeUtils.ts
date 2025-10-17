import { t } from "@matsilva/xtranslate";
import { formatCompactNumber } from "./numberFormatters";

interface TimeUnit {
	value: number;
	unit: string;
}

export function formatDuration(milliseconds: number, compact = true): string {
	if (milliseconds === 0) {
		return "0ms";
	}
	if (milliseconds < 0) {
		return "Invalid duration";
	}

	const hours = Math.floor(milliseconds / (1000 * 60 * 60));
	const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
	const ms = milliseconds % 1000;

	const parts: TimeUnit[] = [];

	if (hours > 0) {
		parts.push({ value: hours, unit: "h" });
	}
	if (minutes > 0) {
		parts.push({ value: minutes, unit: "m" });
	}
	if (seconds > 0) {
		parts.push({ value: seconds, unit: "s" });
	}
	if (ms > 0 && parts.length === 0) {
		parts.push({ value: ms, unit: "ms" });
	}

	// If we have hours, show up to minutes
	// If we have minutes, show up to seconds
	// If we have only seconds, show milliseconds if they exist
	const significantParts = parts.slice(0, parts.length > 1 ? 2 : 1);

	return significantParts
		.map(
			({ value, unit }) =>
				`${compact ? formatCompactNumber(value, 1) : value}${unit}`,
		)
		.join(" ");
}

/**
 * Formats a date string for display in the UI, with special handling for recent dates
 * @param dateString ISO date string to format
 * @returns Formatted date string (e.g. "Today", "Yesterday", "3 days ago", or formatted date)
 */
export function formatRelativeDate(dateString: string): string {
	const dateFormatter = new Intl.DateTimeFormat(navigator.language, {
		dateStyle: "medium",
		timeStyle: "short",
	});

	const date = new Date(dateString || "");
	const now = new Date();
	const diffInDays = Math.round(
		(date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
	);

	// Format the date based on how recent it is
	if (diffInDays === 0) {
		return t("projects.item.date.today");
	}
	if (diffInDays === -1) {
		return t("projects.item.date.yesterday");
	}
	if (diffInDays > -7) {
		return t("projects.item.date.daysAgo", { count: Math.abs(diffInDays) });
	}
	return dateFormatter.format(date);
}
