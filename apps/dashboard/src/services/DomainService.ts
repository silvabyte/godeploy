import { config } from "../config";
import { debug } from "../utils/debug";
import { SessionManager } from "./auth/SessionManager";

interface ValidateResponse {
	isValid: boolean;
	cnameRecord?: string;
	error?: string;
}

interface AvailabilityResponse {
	available: boolean;
	reason?: string;
}

interface AssignResponseProject {
	id: string;
	tenant_id: string;
	owner_id: string;
	name: string;
	subdomain: string;
	domain: string | null;
	description?: string | null;
	url?: string;
	created_at?: string;
	updated_at?: string;
}

export class DomainService {
	private readonly apiBase: string;
	private readonly sessionManager: SessionManager;

	constructor() {
		// Default to production API if env var not present
		const base = config.VITE_API_BASE_URL;
		this.apiBase = base || "https://api.godeploy.app";
		this.sessionManager = SessionManager.getInstance();
	}

	private async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
		const url = `${this.apiBase}${path}`;
		const res = await fetch(url, init);
		if (!res.ok) {
			const text = await res.text().catch(() => "");
			debug.error(
				new Error(`DomainService request failed: ${res.status} ${text}`),
			);
			throw new Error(text || `Request failed with status ${res.status}`);
		}
		return (await res.json()) as T;
	}

	async getCnameTarget(): Promise<{ target: string }> {
		return this.fetchJson("/api/domains/cname-target");
	}

	async validateDomain(domain: string): Promise<ValidateResponse> {
		return this.fetchJson("/api/domains/validate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ domain }),
		});
	}

	private getAuthHeaders(): HeadersInit {
		const token = this.sessionManager.session?.access_token;
		return {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		};
	}

	async checkAvailability(
		domain: string,
		projectId?: string,
	): Promise<AvailabilityResponse> {
		return this.fetchJson("/api/domains/check-availability", {
			method: "POST",
			headers: this.getAuthHeaders(),
			body: JSON.stringify({ domain, projectId }),
		});
	}

	async assignDomain(
		projectId: string,
		domain: string | null,
	): Promise<AssignResponseProject> {
		return this.fetchJson(`/api/projects/${projectId}/domain`, {
			method: "PATCH",
			headers: this.getAuthHeaders(),
			body: JSON.stringify({ domain }),
		});
	}
}
