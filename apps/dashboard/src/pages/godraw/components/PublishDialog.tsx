import {
	ArrowTopRightOnSquareIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { BuildResult } from "../hooks/useBuildGodraw";

interface PublishDialogProps {
	isOpen: boolean;
	isPublishing: boolean;
	buildResult: BuildResult | null;
	error: Error | null;
	onClose: () => void;
	onPublish: () => void;
}

export function PublishDialog({
	isOpen,
	isPublishing,
	buildResult,
	error,
	onClose,
	onPublish,
}: PublishDialogProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
				<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
					{isPublishing
						? "Publishing..."
						: buildResult
							? "Published Successfully!"
							: error
								? "Publish Failed"
								: "Publish Your Site"}
				</h3>

				{/* Initial state */}
				{!isPublishing && !buildResult && !error && (
					<div className="space-y-4">
						<p className="text-sm text-gray-600 dark:text-gray-400">
							This will build your GoDraw project and deploy it to your
							subdomain. All published pages will be included in the build.
						</p>
						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={onClose}
								className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={onPublish}
								className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
							>
								Publish Now
							</button>
						</div>
					</div>
				)}

				{/* Publishing state */}
				{isPublishing && (
					<div className="space-y-4">
						<div className="flex items-center justify-center py-8">
							<div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600 dark:border-gray-700 dark:border-t-green-500" />
						</div>
						<p className="text-center text-sm text-gray-600 dark:text-gray-400">
							Building your site...
						</p>
					</div>
				)}

				{/* Success state */}
				{buildResult && (
					<div className="space-y-4">
						<div className="flex items-center justify-center py-4">
							<CheckCircleIcon className="h-16 w-16 text-green-500" />
						</div>

						<div className="space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
							<div className="text-xs text-gray-500 dark:text-gray-400">
								Build Info
							</div>
							<div className="text-sm">
								<span className="text-gray-600 dark:text-gray-400">Pages:</span>{" "}
								<span className="font-medium text-gray-900 dark:text-white">
									{buildResult.build_info.page_count}
								</span>
							</div>
							<div className="text-sm">
								<span className="text-gray-600 dark:text-gray-400">
									Build time:
								</span>{" "}
								<span className="font-medium text-gray-900 dark:text-white">
									{(buildResult.build_info.build_time_ms / 1000).toFixed(2)}s
								</span>
							</div>
						</div>

						<div className="space-y-2">
							<div className="text-xs text-gray-500 dark:text-gray-400">
								Your site is live at:
							</div>
							<a
								href={buildResult.urls.site}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm font-medium text-blue-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
							>
								<span className="truncate">{buildResult.urls.site}</span>
								<ArrowTopRightOnSquareIcon className="h-4 w-4 flex-shrink-0" />
							</a>
						</div>

						<div className="flex justify-end">
							<button
								type="button"
								onClick={onClose}
								className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
							>
								Close
							</button>
						</div>
					</div>
				)}

				{/* Error state */}
				{error && (
					<div className="space-y-4">
						<div className="flex items-center justify-center py-4">
							<ExclamationTriangleIcon className="h-16 w-16 text-red-500" />
						</div>

						<div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
							<p className="text-sm text-red-800 dark:text-red-300">
								{error.message || "An error occurred while publishing"}
							</p>
						</div>

						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={onClose}
								className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={onPublish}
								className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
							>
								Try Again
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
