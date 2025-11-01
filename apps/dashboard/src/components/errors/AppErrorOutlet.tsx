import { t } from "@matsilva/xtranslate";
import { useEffect } from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import { Logo } from "../../Logo";
import { SupportLink } from "../support/SupportLink";

export function AppErrorOutlet() {
	const error = useRouteError() as Error & { statusText?: string };
	const nav = useNavigate();

	useEffect(() => {}, []);

	return (
		<div className="flex min-h-full flex-1 flex-col justify-center bg-white px-6 py-12 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-sm">
				<div className="flex justify-center">
					<Logo className="h-10" />
				</div>

				<div className="mt-10 flex flex-col items-center space-y-4">
					<h2 className="text-2xl font-bold tracking-tight text-slate-900">
						{t("common.errors.oops")}
					</h2>
				</div>
			</div>

			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
				<div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
					<p className="text-base text-slate-700">
						{error.statusText || error.message || t("common.errors.generic")}
					</p>

					<div className="mt-8 flex flex-col items-center gap-4">
						<button
							type="button"
							onClick={() => nav("/")}
							className="flex w-full justify-center rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
						>
							{t("nav.goHome")}
						</button>
						<div className="text-sm">
							<SupportLink classes="font-semibold text-green-600 hover:text-green-700" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
