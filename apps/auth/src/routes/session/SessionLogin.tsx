import { useEffect } from "react";
import { useFetcher, useLocation, useNavigation } from "react-router-dom";
import { REDIRECT_URL_PARAM } from "../../constants/auth.constants";
import { Logo } from "../../logo/Logo";
import { trackEvent } from "../../router/telemetry/telemetry";
import { SessionManager } from "../../services/auth/SessionManager";

export const LOGIN_ACTION_PATH = "/api/ui/v1/session/login";

export default function Login() {
	const fetcher = useFetcher();
	const nav = useNavigation();
	const { error } = fetcher.data || { error: null };
	const location = useLocation();
	const sessionManager = SessionManager.getInstance();
	useEffect(() => {
		trackEvent("page_view", {
			page: "login",
		});
	}, []);

	// Capture redirect URL from query parameters
	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const redirectUrlParam = searchParams.get(REDIRECT_URL_PARAM);
		if (redirectUrlParam) {
			sessionManager.storeRedirectUrl(redirectUrlParam);
		}
	}, [location, sessionManager]);

	return (
		<div className="min-h-screen bg-white flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-16">
				<div className="text-center">
					<div className="flex justify-center mb-16">
						<Logo className="h-10" />
					</div>
					<h1 className="text-6xl font-light tracking-tight text-slate-900 sm:text-7xl md:text-8xl">
						Sign in.
					</h1>
				</div>

				{error ? (
					<div className="text-center">
						<p className="text-sm font-light text-red-600">
							{error.message}
						</p>
					</div>
				) : null}

				<fetcher.Form
					id="session-submit"
					method="POST"
					action={LOGIN_ACTION_PATH}
					className="space-y-8"
				>
					<div className="space-y-8">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-light text-slate-500 mb-3"
							>
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								placeholder="you@example.com"
								className="block w-full border-0 border-b border-slate-200 bg-transparent px-0 py-3 text-slate-900 placeholder-slate-400 focus:border-green-500 focus:ring-0 text-lg font-light"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-light text-slate-500 mb-3"
							>
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								placeholder="••••••••"
								className="block w-full border-0 border-b border-slate-200 bg-transparent px-0 py-3 text-slate-900 placeholder-slate-400 focus:border-green-500 focus:ring-0 text-lg font-light"
							/>
						</div>
					</div>

					{/* Hidden input for redirect URL */}
					{sessionManager.getStoredRedirectUrlOrDefault() && (
						<input
							type="hidden"
							name={REDIRECT_URL_PARAM}
							value={sessionManager.getStoredRedirectUrlOrDefault()}
						/>
					)}

					<div className="pt-8">
						<button
							type="submit"
							disabled={nav.state === "submitting"}
							className="text-sm font-medium text-slate-900 underline decoration-green-500 decoration-2 underline-offset-4 transition hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{nav.state === "submitting" ? "Signing in..." : "Continue"}
						</button>
					</div>
				</fetcher.Form>
			</div>
		</div>
	);
}
