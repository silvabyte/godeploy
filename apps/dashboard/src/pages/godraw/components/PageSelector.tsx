import { ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import type { GodrawPage } from "../hooks/useGodrawProject";

interface PageSelectorProps {
	pages: GodrawPage[];
	currentPage: GodrawPage | null;
	onPageChange: (page: GodrawPage) => void;
	onNewPage: () => void;
}

export function PageSelector({
	pages,
	currentPage,
	onPageChange,
	onNewPage,
}: PageSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="relative">
			{/* Current page button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
			>
				<span className="min-w-[100px] text-left">
					{currentPage?.name || "Select page"}
				</span>
				<ChevronDownIcon
					className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{/* Dropdown */}
			{isOpen && (
				<>
					{/* Backdrop */}
					<div
						className="fixed inset-0 z-10"
						onClick={() => setIsOpen(false)}
					/>

					{/* Menu */}
					<div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
						<div className="max-h-64 overflow-y-auto p-1">
							{pages.map((page) => (
								<button
									key={page.id}
									type="button"
									onClick={() => {
										onPageChange(page);
										setIsOpen(false);
									}}
									className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
										currentPage?.id === page.id
											? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
											: "text-gray-700 dark:text-gray-200"
									}`}
								>
									<div>
										<div className="font-medium">{page.name}</div>
										<div className="text-xs text-gray-500 dark:text-gray-400">
											/{page.slug}
										</div>
									</div>
									{!page.is_published && (
										<span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
											Draft
										</span>
									)}
								</button>
							))}
						</div>

						{/* Add new page button */}
						<div className="border-t border-gray-200 p-1 dark:border-gray-700">
							<button
								type="button"
								onClick={() => {
									onNewPage();
									setIsOpen(false);
								}}
								className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
							>
								<PlusIcon className="h-4 w-4" />
								Add new page
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
