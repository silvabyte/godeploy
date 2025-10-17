export function DeploymentSkeletonItem() {
	return (
		<li className="group relative flex items-center space-x-4 px-4 py-4 transition-colors sm:px-6">
			<div className="min-w-0 flex-auto">
				<div className="flex items-center gap-x-3">
					<div className="flex-none rounded-full p-1 bg-slate-100">
						<div className="size-2 rounded-full bg-slate-200 animate-pulse" />
					</div>
					<h2 className="min-w-0 text-sm font-medium flex gap-x-2">
						<span className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
						<span className="text-slate-300">/</span>
						<span className="h-5 w-48 bg-slate-100 rounded animate-pulse" />
					</h2>
				</div>
				<div className="mt-2 flex items-center gap-x-2.5 text-xs">
					<span className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
					<svg
						aria-hidden="true"
						viewBox="0 0 2 2"
						className="size-0.5 flex-none fill-slate-300"
					>
						<circle r={1} cx={1} cy={1} />
					</svg>
					<span className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
				</div>
			</div>
			<div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
		</li>
	);
}
