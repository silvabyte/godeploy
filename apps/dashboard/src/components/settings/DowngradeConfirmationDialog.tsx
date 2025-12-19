import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
	ExclamationTriangleIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { Form } from "react-router-dom";

interface DowngradeConfirmationDialogProps {
	open: boolean;
	onClose: () => void;
	fromTier: {
		name: string;
		features: string[];
	};
	toTier: {
		id: string;
		name: string;
	};
	isOnTrial: boolean;
}

export function DowngradeConfirmationDialog({
	open,
	onClose,
	fromTier,
	toTier,
	isOnTrial,
}: DowngradeConfirmationDialogProps) {
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
						className="flex w-full transform text-left text-base transition data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in md:my-8 md:max-w-lg md:px-4 data-closed:md:translate-y-0 data-closed:md:scale-95"
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

							<div className="grid w-full gap-y-6">
								<div className="text-center">
									<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
										<ExclamationTriangleIcon
											className="h-6 w-6 text-amber-600"
											aria-hidden="true"
										/>
									</div>
									<h2 className="mt-4 font-mono text-2xl font-bold tracking-tight text-slate-900">
										Downgrade to {toTier.name}?
									</h2>
									<p className="mt-3 text-sm font-mono text-slate-600">
										You're about to switch from {fromTier.name} to {toTier.name}
										.
									</p>
								</div>

								<div className="rounded-2xl bg-amber-50 p-4">
									<h3 className="font-mono text-sm font-medium text-amber-800">
										You'll lose access to:
									</h3>
									<ul className="mt-3 space-y-2">
										{fromTier.features.map((feature) => (
											<li
												key={feature}
												className="flex items-start gap-x-2 font-mono text-sm text-amber-700"
											>
												<span className="text-amber-500">-</span>
												{feature}
											</li>
										))}
									</ul>
								</div>

								{isOnTrial && (
									<div className="rounded-2xl bg-red-50 p-4">
										<p className="font-mono text-sm text-red-700">
											<strong>Note:</strong> You're currently on a trial. If you
											downgrade now, you won't be able to start another trial in
											the future.
										</p>
									</div>
								)}

								<div className="flex gap-3">
									<button
										type="button"
										onClick={onClose}
										className="flex-1 rounded-full px-4 py-2.5 text-center font-mono text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
									>
										Keep {fromTier.name}
									</button>
									<Form method="post" className="flex-1">
										<input type="hidden" name="tierId" value={toTier.id} />
										<input type="hidden" name="isDowngrade" value="true" />
										<button
											type="submit"
											className="w-full rounded-full bg-amber-500 px-4 py-2.5 text-center font-mono text-sm font-medium text-white shadow-sm hover:bg-amber-600 active:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
										>
											Confirm Downgrade
										</button>
									</Form>
								</div>
							</div>
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	);
}
