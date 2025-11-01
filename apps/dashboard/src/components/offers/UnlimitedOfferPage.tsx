import React from "react";
import { Form } from "react-router-dom";
import { Badge } from "../Badge";

export function UnlimitedOfferPage() {
	const gradientId = React.useId();
	return (
		<div className="relative isolate flex h-[calc(100vh-65px)] items-center overflow-hidden bg-gray-900">
			<div className="w-full px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
				<div className="mx-auto max-w-2xl text-center">
					<div className="flex items-center justify-center gap-x-3 mb-4 relative">
						<h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
							Limited Time Offer
						</h2>
						<Badge status="beta" className="text-sm absolute top-0 right-0" />
					</div>
					<p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-300">
						Lock in unlimited access for just $49/year! This special offer
						includes all features and unlimited usage.
					</p>
					<div className="mt-10 flex items-center justify-center gap-x-6">
						<Form method="post">
							<button
								type="button"
								className=" cursor-pointer rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
							>
								Claim Offer Now
							</button>
						</Form>
						<a href="/" className="text-sm font-semibold leading-6 text-white">
							Maybe Later <span aria-hidden="true">→</span>
						</a>
					</div>
				</div>
			</div>
			<svg
				aria-hidden="true"
				className="absolute top-1/2 left-1/2 -z-10 size-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
			>
				<circle
					r={512}
					cx={512}
					cy={512}
					fill={`url(#${gradientId})`}
					fillOpacity="0.7"
				/>
				<defs>
					<radialGradient id={gradientId}>
						<stop stopColor="#6366f1" />
						<stop offset={1} stopColor="#4f46e5" />
					</radialGradient>
				</defs>
			</svg>
		</div>
	);
}
