import { t } from "@matsilva/xtranslate";
import { useEffect } from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import { Logo } from "../../logo/Logo";
import { SupportLink } from "../support/SupportLink";

export function AppErrorOutlet() {
	const error = useRouteError() as Error & { statusText?: string };
	const nav = useNavigate();

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-full flex-1 flex-col justify-center px-6 py-16 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="flex justify-center mb-16">
					<Logo className="h-10" />
				</div>

				<div className="text-center space-y-16">
					<h1 className="text-6xl font-light tracking-tight text-slate-900 sm:text-7xl md:text-8xl">
						{t("common.errors.oops")}
					</h1>

					<p className="text-sm font-light text-slate-600">
						{error.statusText || error.message || t("common.errors.generic")}
					</p>

					<div className="flex flex-col items-center gap-6 pt-4">
						<button
							onClick={() => nav("/")}
							className="text-sm font-medium text-slate-900 underline decoration-green-500 decoration-2 underline-offset-4 transition hover:text-green-600"
						>
							{t("nav.goHome")}
						</button>
						<div className="text-sm">
							<SupportLink classes="font-light text-slate-500 hover:text-slate-900" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
