interface AppPlatformDomainResponse {
	domain?: {
		id?: string;
		name?: string;
		type?: string;
		wildcard?: boolean;
		state?: string;
	};
	links?: unknown;
	meta?: unknown;
}

interface ServiceResult<T = undefined> {
	ok: boolean;
	data?: T;
	error?: string;
}

interface RequestOptions {
	body?: string;
}

type FetchResponse = {
	ok: boolean;
	status: number;
	json(): Promise<unknown>;
};

type JsonBody = AppPlatformDomainResponse | { message?: string };

interface AppSpecDomain {
	domain: string;
	type?: string;
	wildcard?: boolean;
}

interface AppSpec {
	domains?: AppSpecDomain[];
	[key: string]: unknown;
}

interface AppResponse {
	app?: {
		spec?: AppSpec;
	};
}

/**
 * Minimal DigitalOcean App Platform client for managing custom domains.
 */
export class DigitalOceanAppPlatformService {
	private static readonly API_BASE = "https://api.digitalocean.com/v2";

	static fromEnv(): DigitalOceanAppPlatformService | null {
		const token = process.env.DIGITAL_OCEAN_TOKEN;
		const appId =
			process.env.DIGITAL_OCEAN_NGINX_APP_ID ??
			process.env.DIGITAL_OCEAN_APP_ID;

		if (!token || !appId) return null;

		return new DigitalOceanAppPlatformService(token, appId);
	}

	private constructor(
		private readonly token: string,
		private readonly appId: string,
	) {}

	async addDomain(domain: string): Promise<ServiceResult> {
		return this.ensureDomainInSpec(domain, true);
	}

	async removeDomain(domain: string): Promise<ServiceResult> {
		return this.ensureDomainInSpec(domain, false);
	}

	private async ensureDomainInSpec(
		domain: string,
		present: boolean,
	): Promise<ServiceResult> {
		const specResult = await this.getAppSpec();

		if (!specResult.ok || !specResult.data?.app?.spec) {
			return {
				ok: false,
				error:
					specResult.error || "Unable to retrieve app spec from DigitalOcean",
			};
		}

		const spec = this.cloneSpec(specResult.data.app.spec);
		const domains = Array.isArray(spec.domains) ? [...spec.domains] : [];
		const normalized = domain.toLowerCase();
		const exists = domains.some((d) => d.domain?.toLowerCase() === normalized);

		if (present) {
			if (exists) {
				return { ok: true };
			}
			domains.push({ domain: normalized });
		} else {
			if (!exists) {
				return { ok: true };
			}
			spec.domains = domains.filter(
				(d) => d.domain?.toLowerCase() !== normalized,
			);
		}

		if (present) {
			spec.domains = domains;
		}

		const updateResult = await this.updateAppSpec(spec);
		if (!updateResult.ok) {
			return updateResult;
		}

		return { ok: true };
	}

	private async getAppSpec(): Promise<ServiceResult<AppResponse>> {
		return this.request<AppResponse>("GET", `/apps/${this.appId}`);
	}

	private async updateAppSpec(spec: AppSpec): Promise<ServiceResult> {
		return this.request("PUT", `/apps/${this.appId}`, {
			body: JSON.stringify({ spec }),
		});
	}

	private cloneSpec(spec: AppSpec): AppSpec {
		return JSON.parse(JSON.stringify(spec)) as AppSpec;
	}

	private async request<T = undefined>(
		method: string,
		path: string,
		init: RequestOptions = {},
	): Promise<ServiceResult<T>> {
		const url = `${DigitalOceanAppPlatformService.API_BASE}${path}`;

		let response: FetchResponse;

		try {
			const rawResponse = await fetch(url, {
				method,
				headers: {
					Authorization: `Bearer ${this.token}`,
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: init.body,
			});
			// Bun/Node fetch responses include the fields we care about, but their
			// typings do not align with our minimal interface, so coerce via unknown.
			response = rawResponse as unknown as FetchResponse;
		} catch (error) {
			return {
				ok: false,
				error:
					error instanceof Error
						? error.message
						: "DigitalOcean API request failed",
			};
		}

		if (response.ok) {
			let data: T | undefined;

			if (response.status !== 204) {
				try {
					data = (await response.json()) as T;
				} catch {}
			}

			return data !== undefined ? { ok: true, data } : { ok: true };
		}

		const status = response.status;
		let body: JsonBody | null = null;

		try {
			body = (await response.json()) as
				| AppPlatformDomainResponse
				| { message?: string };
		} catch {}

		// 409/422 typically means the domain already exists – treat as success.
		if (status === 409 || status === 422) {
			return { ok: true };
		}

		// 404 during deletion means the domain was already removed.
		if (status === 404 && method === "DELETE") {
			return { ok: true };
		}

		const statusText = `DigitalOcean API responded with status ${status}`;
		const detailedMessage =
			(body && "message" in body && body.message) ||
			(body && "domain" in body && body.domain?.state);

		const errorMessage = detailedMessage
			? `${statusText}: ${detailedMessage}`
			: statusText;

		return {
			ok: false,
			error: errorMessage,
		};
	}
}
