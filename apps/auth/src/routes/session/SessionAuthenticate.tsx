import { t } from "@matsilva/xtranslate";
import { useEffect } from "react";
import { Link, useLoaderData } from "react-router-dom";
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
		<div className="min-h-screen bg-white flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-16">
				<div className="text-center">
					<div className="flex justify-center mb-16">
						<Logo className="h-10" />
					</div>
					<h1 className="text-6xl font-light tracking-tight text-slate-900 sm:text-7xl md:text-8xl">
						{t("session.authenticate.oops")}
					</h1>
				</div>

				<div className="text-center space-y-8">
					<p className="text-sm font-light text-red-600">{error}</p>
					<p className="text-base font-light text-slate-600">
						{t("session.authenticate.please")}{" "}
						<Link
							to="/"
							className="text-slate-900 underline decoration-green-500 decoration-2 underline-offset-4 transition hover:text-green-600"
						>
							{t("session.authenticate.signingIn")}
						</Link>{" "}
						{t("session.authenticate.again")}
					</p>
					<div className="pt-4">
						<SupportLink />
					</div>
				</div>
			</div>
		</div>
	) : null;
}
