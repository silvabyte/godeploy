import { useNavigate, useRouteError } from "react-router-dom";
import { t } from "@matsilva/xtranslate";
import { SupportLink } from "../support/SupportLink";
import { useEffect } from "react";
import { Logo } from "../../logo/Logo";

export function AppErrorOutlet() {
	const error = useRouteError() as Error & { statusText?: string };
	const nav = useNavigate();

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-sm">
				<div className="flex justify-center">
					<Logo className="[&_circle]:!fill-indigo-500 [&_path]:!stroke-white [&_tspan]:!fill-white" />
				</div>

				<div className="mt-10 flex flex-col items-center space-y-4">
					<h2 className="text-2xl font-bold tracking-tight text-white">
						{t("common.errors.oops")}
					</h2>
				</div>
			</div>

			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
				<div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
					<p className="text-base text-gray-300">
						{error.statusText || error.message || t("common.errors.generic")}
					</p>

					<div className="mt-8 flex flex-col items-center gap-4">
						<button
							onClick={() => nav("/")}
							className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						>
							{t("nav.goHome")}
						</button>
						<div className="text-sm">
							<SupportLink classes="font-semibold text-indigo-400 hover:text-indigo-300" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
