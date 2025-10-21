import { t } from "@matsilva/xtranslate";
import { useEffect } from "react";
import { useFetcher, useLocation, useNavigation } from "react-router-dom";
import { Alert } from "../../components/alerts/Alert";
import { Button } from "../../components/Button";
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
		<div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<div className="flex justify-center">
						<Logo className="h-16" />
					</div>
					<h2 className="mt-8 text-2xl font-bold tracking-tight text-slate-900">
						{t("session.signin.title")}
					</h2>
					<p className="mt-2 text-sm text-slate-600">Sign in to your account</p>
				</div>

				<div className="bg-white shadow sm:rounded-lg">
					{error ? (
						<div className="px-4 pt-5 sm:px-6">
							<Alert type="danger" title={error.message} />
						</div>
					) : null}

					<fetcher.Form
						id="session-submit"
						method="POST"
						action={LOGIN_ACTION_PATH}
					>
						<div className="px-4 py-5 sm:p-6">
							<div className="space-y-6">
								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-slate-700"
									>
										{t("session.inputs.email.label")}
									</label>
									<div className="mt-1">
										<input
											id="email"
											name="email"
											type="email"
											autoComplete="email"
											required
											placeholder={t("session.inputs.email.placeholder")}
											className="block w-full rounded-md border-slate-200 bg-slate-50 py-2 px-3 text-slate-900 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm"
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="password"
										className="block text-sm font-medium text-slate-700"
									>
										{t("session.inputs.password.label")}
									</label>
									<div className="mt-1">
										<input
											id="password"
											name="password"
											type="password"
											autoComplete="current-password"
											required
											placeholder={t("session.inputs.password.placeholder")}
											className="block w-full rounded-md border-slate-200 bg-slate-50 py-2 px-3 text-slate-900 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm"
										/>
									</div>
								</div>
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

						<div className="px-4 py-3 text-right sm:px-6 border-t border-slate-200">
							<Button
								type="submit"
								disabled={nav.state === "submitting"}
								variant="primary"
								color="green"
								className="w-full justify-center"
							>
								{nav.state === "submitting"
									? "Signing in..."
									: t("session.signin.loginButton")}
							</Button>
						</div>
					</fetcher.Form>
				</div>
			</div>
		</div>
	);
}
