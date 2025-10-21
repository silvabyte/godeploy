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
		<div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<div className="flex justify-center">
						<Logo className="h-16" />
					</div>
					<div className="mt-8 flex items-center justify-center gap-4">
						<div className="rounded-full bg-green-50 p-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="w-8 h-8 text-green-500"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold tracking-tight text-slate-900">
							{t("session.verify.emailSent")}
						</h2>
					</div>
				</div>

				<div className="bg-white shadow sm:rounded-lg">
					<div className="px-4 py-5 sm:p-6">
						<div className="space-y-6 text-center">
							<div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
								<p className="text-lg text-slate-700">
									{t("session.verify.checkInbox")}
								</p>
							</div>
							<div className="flex items-center justify-center gap-3">
								<p className="text-sm text-slate-500">
									{t("session.verify.spam")}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
