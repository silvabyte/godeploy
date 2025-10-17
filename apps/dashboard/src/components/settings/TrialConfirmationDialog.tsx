import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Form } from "react-router-dom";

interface TrialConfirmationDialogProps {
	open: boolean;
	onClose: () => void;
	tier: {
		name: string;
		id: string;
		price: string;
		price_cents: number;
		description: string;
		features: string[];
	};
}

export function TrialConfirmationDialog({
	open,
	onClose,
	tier,
}: TrialConfirmationDialogProps) {
	const isFree = tier.price_cents === 0;

	return (
		<Dialog open={open} onClose={onClose} className="relative z-10">
			<DialogBackdrop
				transition
				className="fixed inset-0 hidden bg-white/80 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in md:block"
			/>

			<div className="fixed inset-0 z-10 w-screen overflow-y-auto">
				<div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
					<DialogPanel
						transition
						className="flex w-full transform text-left text-base transition data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in md:my-8 md:max-w-2xl md:px-4 data-closed:md:translate-y-0 data-closed:md:scale-95"
					>
						<div className="relative flex w-full items-center overflow-hidden bg-white px-4 pb-8 pt-14 shadow-lg sm:px-6 sm:pt-8 md:p-6 lg:p-8 rounded-3xl ring-1 ring-slate-900/10">
							<button
								type="button"
								onClick={onClose}
								className="absolute right-4 top-4 text-slate-500 hover:text-slate-600 sm:right-6 sm:top-8 md:right-6 md:top-6 lg:right-8 lg:top-8"
							>
								<span className="sr-only">Close</span>
								<XMarkIcon aria-hidden="true" className="size-6" />
							</button>

							<div className="grid w-full gap-y-8">
								<div className="text-center">
									<h2 className="font-mono text-3xl font-bold tracking-tight text-slate-900">
										{tier.name}
									</h2>
									<p className="mt-3 text-lg font-mono text-slate-600">
										{tier.description}
									</p>
								</div>

								<div className="mx-auto w-full max-w-md">
									<div className="grid gap-y-8">
										<div>
											<h3 className="font-mono text-sm font-medium text-green-500">
												Features
											</h3>
											<ul className="mt-4 grid gap-y-3">
												{tier.features.map((feature) => (
													<li
														key={feature}
														className="flex items-start gap-x-3"
													>
														<CheckIcon
															aria-hidden="true"
															className="h-5 w-5 flex-none text-green-500"
														/>
														<span className="font-mono text-sm text-slate-600">
															{feature}
														</span>
													</li>
												))}
											</ul>
										</div>

										<div className="rounded-3xl bg-slate-50 p-8">
											<h3 className="font-mono text-lg font-semibold text-center text-slate-900">
												{isFree
													? "Get started for free"
													: "Start your free trial"}
											</h3>

											<div className="mt-6 flex items-baseline justify-center gap-x-2">
												<span className="font-mono text-5xl font-bold tracking-tight text-slate-900">
													{tier.price}
												</span>
												{!isFree && (
													<span className="font-mono text-sm font-medium text-slate-600">
														/year
													</span>
												)}
											</div>

											<Form method="post" className="mt-8">
												<input type="hidden" name="tierId" value={tier.id} />
												<button
													type="button"
													className="block w-full rounded-full bg-green-500 px-4 py-2.5 text-center font-mono text-sm font-medium text-white shadow-sm hover:bg-green-600 active:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
												>
													{isFree ? "Get Started" : "Start 14-Day Free Trial"}
												</button>
											</Form>

											<p className="mt-6 text-center font-mono text-sm text-slate-500">
												{isFree
													? "No credit card required. Free forever."
													: "No credit card required. Cancel anytime during your trial."}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	);
}
