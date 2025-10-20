import { makeAutoObservable } from "mobx";
import type { Session } from "@supabase/supabase-js";
import { config } from "../../config";
import {
	JWT_STORAGE_KEY,
	REDIRECT_URL_PARAM,
	SESSION_STORAGE_KEY,
	BACKUP_JWT_STORAGE_KEY,
	REDIRECT_URL_STORAGE_KEY,
} from "../../constants/auth.constants";

export class SessionManager {
	private static instance: SessionManager;
	private currentSession: Session | null = null;

	private constructor() {
		makeAutoObservable(this);
		this.loadSession();
	}

	static getInstance(): SessionManager {
		if (!SessionManager.instance) {
			SessionManager.instance = new SessionManager();
		}
		return SessionManager.instance;
	}

	private loadSession() {
		const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
		this.currentSession = storedSession ? JSON.parse(storedSession) : null;
	}

	get session() {
		return this.currentSession;
	}

	setSession(session: Session | null) {
		if (!session) {
			this.clearSession();
			return;
		}
		localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
		localStorage.setItem(JWT_STORAGE_KEY, session.access_token);
		localStorage.setItem(BACKUP_JWT_STORAGE_KEY, session.access_token);
		this.currentSession = session;
	}

	clearSession() {
		this.currentSession = null;
		localStorage.removeItem(SESSION_STORAGE_KEY);
		localStorage.removeItem(JWT_STORAGE_KEY);
		localStorage.removeItem(BACKUP_JWT_STORAGE_KEY);
	}

	// Redirect URL management
	getRedirectUrl(requestUrl: string): string {
		const queryParams = new URL(requestUrl).searchParams;
		const rawRedirect =
			queryParams.get(REDIRECT_URL_PARAM) ??
			`${config.VITE_DASHBOARD_BASE_URL}/session`;
		return this.normalizeDashboardUrl(rawRedirect);
	}

	storeRedirectUrl(url: string) {
		if (typeof window !== "undefined") {
			localStorage.setItem(REDIRECT_URL_STORAGE_KEY, url);
		}
	}

	getStoredRedirectUrlOrDefault(): string {
		const existingRedirectUrl =
			typeof window !== "undefined"
				? localStorage.getItem(REDIRECT_URL_STORAGE_KEY)
				: null;
		return existingRedirectUrl ?? `${config.VITE_DASHBOARD_BASE_URL}/session`;
	}

	clearStoredRedirectUrl() {
		if (typeof window !== "undefined") {
			localStorage.removeItem(REDIRECT_URL_STORAGE_KEY);
		}
	}

	private normalizeDashboardUrl(url: string): string {
		try {
			const dashboardUrl = new URL(config.VITE_DASHBOARD_BASE_URL);
			const parsed = new URL(url);

			const cleanBase =
				dashboardUrl.origin + dashboardUrl.pathname.replace(/\/$/, "");
			const candidateBase = parsed.origin + parsed.pathname.replace(/\/$/, "");

			if (candidateBase === cleanBase) {
				return `${cleanBase}/session`;
			}

			return url;
		} catch {
			return `${config.VITE_DASHBOARD_BASE_URL.replace(/\/$/, "")}/session`;
		}
	}

	isInternalUrl(url: string): boolean {
		return (
			url === `${config.VITE_DASHBOARD_BASE_URL.replace(/\/$/, "")}/session`
		);
	}
}
