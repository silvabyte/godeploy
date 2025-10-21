import type { AuthChangeEvent } from "@supabase/auth-js";
import type {
	AuthOtpResponse,
	AuthResponse,
	Session,
	SupabaseClient,
	UserResponse,
} from "@supabase/supabase-js";
import { autorun } from "mobx";
import { config } from "../../config";
import { REDIRECT_URL_PARAM } from "../../constants/auth.constants";
import { debug } from "../../utils/debug";
import { addQueryParam } from "../../utils/url";
import { withTimeout } from "./async-utils";
import { SessionManager } from "./SessionManager";
export interface AuthConfig {
	supabaseUrl: string;
	supabaseKey: string;
	authBaseUrl: string;
	timeoutDuration?: number;
}

/**
 * Service for handling authentication operations
 */
export class AuthService {
	private client: SupabaseClient;
	private authBaseUrl: string;
	private timeoutDuration: number;
	private timeoutInSeconds: number;
	private sessionManager: SessionManager;

	constructor(client: SupabaseClient, options: { config?: AuthConfig } = {}) {
		this.client = client;
		this.sessionManager = SessionManager.getInstance();
		const session = this.sessionManager.session;
		if (session) {
			this.client.auth.setSession(session);
		}
		this.authBaseUrl = options.config?.authBaseUrl || config.VITE_AUTH_BASE_URL;
		this.timeoutDuration = options.config?.timeoutDuration || 5000;
		this.timeoutInSeconds = this.timeoutDuration / 1000;
		autorun(() => {
			const session = this.sessionManager.session;
			if (session) {
				this.client.auth.setSession(session);
			} else {
				this.client.auth.signOut();
			}
		});
	}

	onAuthStateChange(
		callback: (event: AuthChangeEvent, session: Session | null) => void,
	) {
		return this.client.auth.onAuthStateChange(callback);
	}

	async tryRefreshSession() {
		const session = this.sessionManager.session;
		if (session?.expires_at) {
			const exp = new Date(session.expires_at * 1000);
			const now = new Date();
			const timeDiff = exp.getTime() - now.getTime();
			if (timeDiff < 60 * 1000) {
				const refreshedSession = await this.refreshSession(
					session.refresh_token,
				);
				if (refreshedSession) {
					this.sessionManager.setSession(refreshedSession);
				}
			}
		}
	}

	async getCurrentUser(jwt?: string) {
		await this.tryRefreshSession();
		const session = this.sessionManager.session;
		const {
			data: { user },
			error,
		} = await withTimeout<UserResponse>({
			promise: this.client.auth.getUser(jwt || session?.access_token),
			timeoutDuration: this.timeoutDuration,
			timeoutReason: `client.auth.getUser timed out after ${this.timeoutInSeconds}s`,
		});

		if (error) {
			debug.log(
				"[AuthService] Error fetching user with jwt: " + session?.access_token,
			);
			debug.error(error);
			return null;
		}

		return user;
	}

	async refreshOnLoad() {
		const session = this.sessionManager.session;
		if (session?.refresh_token) {
			const refreshedSession = await this.refreshSession(session.refresh_token);
			if (refreshedSession) {
				this.sessionManager.setSession(refreshedSession);
			}
			return refreshedSession;
		}
		return null;
	}

	async refreshSession(refreshToken: string) {
		const {
			data: { session },
			error,
		} = await withTimeout<AuthResponse>({
			promise: this.client.auth.refreshSession({ refresh_token: refreshToken }),
			timeoutDuration: this.timeoutDuration,
			timeoutReason: `client.auth.refreshSession timed out after ${this.timeoutInSeconds}s`,
		});
		if (error) {
			return null;
		}
		return session;
	}

	async signInWithEmail(email: string | null, redirectUrl?: string) {
		if (!email) {
			debug.log("[AuthService] signInWithEmail failed because email is empty");
			return { data: null, error: new Error(`email cannot be empty`) };
		}

		// Always have confirmation redirect to the auth app's /authenticate route
		const emailRedirectTo = addQueryParam(
			`${this.authBaseUrl}/authenticate`,
			REDIRECT_URL_PARAM,
			redirectUrl || config.VITE_DASHBOARD_BASE_URL,
		);

		debug.log("[AuthService] signInWithEmail redirects: " + emailRedirectTo);

		const { data, error } = await withTimeout<AuthOtpResponse>({
			promise: this.client.auth.signInWithOtp({
				email: email,
				options: {
					emailRedirectTo,
					shouldCreateUser: true,
				},
			}),
			timeoutDuration: this.timeoutDuration,
			timeoutReason: `client.auth.signInWithOtp timed out after ${this.timeoutInSeconds}s`,
		});
		return { data, error: error ? new Error(error.message) : null };
	}

	async signInWithPassword(email: string | null, password: string | null) {
		if (!email) {
			debug.log(
				"[AuthService] signInWithPassword failed because email is empty",
			);
			return { data: null, error: new Error(`email cannot be empty`) };
		}

		if (!password) {
			debug.log(
				"[AuthService] signInWithPassword failed because password is empty",
			);
			return { data: null, error: new Error(`password cannot be empty`) };
		}

		debug.log("[AuthService] signInWithPassword for email: " + email);

		const { data, error } = await withTimeout<AuthResponse>({
			promise: this.client.auth.signInWithPassword({
				email: email,
				password: password,
			}),
			timeoutDuration: this.timeoutDuration,
			timeoutReason: `client.auth.signInWithPassword timed out after ${this.timeoutInSeconds}s`,
		});

		if (data?.session) {
			this.sessionManager.setSession(data.session);
		}

		return { data, error: error ? new Error(error.message) : null };
	}

	async signUp(email: string | null, password: string | null) {
		if (!email) {
			debug.log("[AuthService] signUp failed because email is empty");
			return { data: null, error: new Error(`email cannot be empty`) };
		}

		if (!password) {
			debug.log("[AuthService] signUp failed because password is empty");
			return { data: null, error: new Error(`password cannot be empty`) };
		}

		debug.log("[AuthService] signUp for email: " + email);

		const { data, error } = await withTimeout<AuthResponse>({
			promise: this.client.auth.signUp({
				email: email,
				password: password,
			}),
			timeoutDuration: this.timeoutDuration,
			timeoutReason: `client.auth.signUp timed out after ${this.timeoutInSeconds}s`,
		});

		if (data?.session) {
			this.sessionManager.setSession(data.session);
		}

		return { data, error: error ? new Error(error.message) : null };
	}

	async logout() {
		const { error } = await withTimeout({
			promise: this.client.auth.signOut(),
			timeoutDuration: this.timeoutDuration,
			timeoutReason: `client.auth.signOut timed out after ${this.timeoutInSeconds}s`,
		});
		this.sessionManager.clearSession();
		return error;
	}

	clearSession() {
		this.sessionManager.clearSession();
	}
}
