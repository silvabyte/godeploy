import { t } from "@matsilva/xtranslate";
import { useEffect } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { Alert } from "../../components/alerts/Alert";
import { Logo } from "../../logo/Logo";
import { trackEvent } from "../../router/telemetry/telemetry";
import { SupportLink } from "../../support/SupportLink";

export interface SessionAuthenticateLoaderResponse {
	error: string | null;
}

export default function SessionAuthenticate() {
	const { error } = useLoaderData() as SessionAuthenticateLoaderResponse;

	useEffect(() => {
		trackEvent("page_view", {
			page: "authenticate",
		});
	}, []);

	return error ? (
		<div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<div className="flex justify-center">
						<Logo className="h-16" />
					</div>
					<h2 className="mt-8 text-2xl font-bold tracking-tight text-slate-900">
						{t("session.authenticate.oops")}
					</h2>
				</div>

				<div className="bg-white shadow sm:rounded-lg">
					<div className="px-4 py-5 sm:p-6">
						<div className="space-y-4">
							<Alert type="danger" title={error} />
							<p className="text-slate-700">
								{t("session.authenticate.please")}{" "}
								<Link
									to="/"
									className="text-green-600 hover:text-green-500 underline"
								>
									{t("session.authenticate.signingIn")}
								</Link>{" "}
								{t("session.authenticate.again")} <SupportLink />
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	) : null;
}
