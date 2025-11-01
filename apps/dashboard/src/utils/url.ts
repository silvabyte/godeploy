import { isBefore, parseISO } from "date-fns";
import type { Project } from "../pages/projects/project.types.ts";
import { debug } from "./debug";

/**
 * Adds a query parameter to a URL, handling existing parameters correctly
 * @param baseUrl The base URL to add the parameter to
 * @param paramName The name of the parameter to add
 * @param paramValue The value of the parameter to add
 * @returns The URL with the new parameter added
 */
export function addQueryParam(
	baseUrl: string,
	paramName: string,
	paramValue: string,
): string {
	try {
		const url = new URL(baseUrl);
		url.searchParams.append(paramName, paramValue);
		return url.toString();
	} catch (error: unknown) {
		debug.error("[URL Utils] Error adding query param:", { error });
		// Fallback to simple string manipulation if URL parsing fails
		const separator = baseUrl.includes("?") ? "&" : "?";
		return `${baseUrl}${separator}${paramName}=${encodeURIComponent(paramValue)}`;
	}
}

/**
 * Adds multiple query parameters to a URL
 * @param baseUrl The base URL to add parameters to
 * @param params Object containing parameter names and values
 * @returns The URL with all parameters added
 */
// Removed unused helper to satisfy TS noUnusedLocals

/**
 * Gets URL parameters from the hash fragment
 */
// Removed unused helper to satisfy TS noUnusedLocals

/**
 * Constructs the CDN URL for a subdomain
 * This is the new implementation that uses the short subdomain only
 * @param subdomain The unique subdomain
 * @returns The full CDN URL
 */
// Removed unused helper to satisfy TS noUnusedLocals

export class UrlFormatter extends URL {
	static from(uncleanUrl: string) {
		return new UrlFormatter(UrlFormatter.normalize.protocol(uncleanUrl));
	}
	static normalize = {
		protocol(url: string) {
			if (!url.startsWith("http")) {
				return `https://${url}`;
			}
			return url;
		},
	};
}

export class ProjectDomain {
	private project: Project;
	constructor(project: Project) {
		this.project = project;
	}

	get isLegacy() {
		const cutoffDate = parseISO("2025-04-11");
		return this.project.updated_at
			? isBefore(parseISO(this.project.updated_at), cutoffDate)
			: false;
	}

	static from = (project: Project) => new ProjectDomain(project);

	/*
	 * determine() will determine which full origin url to use for the deployment based on if a custom domain has been configured
	 */
	determine = () =>
		this.project.domain ? this.domain.origin : this.subdomain.origin;

	static SUBDOMAIN_HOST_AFFIX = "spa.godeploy.app";

	static STORAGE_BUCKET = "spa-projects";

	formatters = {
		subdomain: () =>
			this.isLegacy
				? `${this.project.name}--${this.project.tenant_id}.${ProjectDomain.SUBDOMAIN_HOST_AFFIX}`
				: `${this.project.subdomain}.${ProjectDomain.SUBDOMAIN_HOST_AFFIX}`,
	};
	get subdomain(): UrlFormatter {
		return UrlFormatter.from(this.formatters.subdomain());
	}

	get domain(): UrlFormatter {
		return UrlFormatter.from(this.project.domain as string);
	}

	get storage(): { key: string } {
		return {
			key: this.project.domain
				? `${ProjectDomain.STORAGE_BUCKET}/${this.domain.host}`
				: `${ProjectDomain.STORAGE_BUCKET}/${this.subdomain.host}`,
		};
	}
}
