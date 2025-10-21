import { t } from "@matsilva/xtranslate";
import { useEffect } from "react";
import { Logo } from "../../logo/Logo";
import { trackEvent } from "../../router/telemetry/telemetry";

export default function Verify() {
	useEffect(() => {
		trackEvent("page_view", {
			page: "login",
		});
	}, []);
	return (
		<div className="min-h-screen bg-white flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-16">
				<div className="text-center">
					<div className="flex justify-center mb-16">
						<Logo className="h-10" />
					</div>
					<h1 className="text-6xl font-light tracking-tight text-slate-900 sm:text-7xl md:text-8xl">
						Check your email.
					</h1>
				</div>

				<div className="text-center space-y-8">
					<p className="text-lg font-light text-slate-600">
						{t("session.verify.checkInbox")}
					</p>
					<p className="text-sm font-light text-slate-500">
						{t("session.verify.spam")}
					</p>
				</div>
			</div>
		</div>
	);
}
