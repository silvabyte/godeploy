import {
	Bars3Icon,
	EyeIcon,
	EyeSlashIcon,
	HomeIcon,
	PencilIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import type { GodrawPage, GodrawProject } from "../hooks/useGodrawProject";

interface PageManagerProps {
	project: GodrawProject;
	pages: GodrawPage[];
	onClose: () => void;
	onPageUpdate: (pageId: string, data: { is_published?: boolean }) => void;
	onPageDelete: (pageId: string) => void;
	onPageReorder: (pageIds: string[]) => void;
	onSetHomePage: (pageId: string) => void;
}

export function PageManager({
	project,
	pages,
	onClose,
	onPageUpdate,
	onPageDelete,
	onPageReorder,
	onSetHomePage,
}: PageManagerProps) {
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [draggedPageId, setDraggedPageId] = useState<string | null>(null);

	const handleDragStart = (pageId: string) => {
		setDraggedPageId(pageId);
	};

	const handleDragOver = (e: React.DragEvent, targetPageId: string) => {
		e.preventDefault();
		if (!draggedPageId || draggedPageId === targetPageId) return;

		const draggedIndex = pages.findIndex((p) => p.id === draggedPageId);
		const targetIndex = pages.findIndex((p) => p.id === targetPageId);

		if (draggedIndex === -1 || targetIndex === -1) return;

		const newPages = [...pages];
		const [draggedPage] = newPages.splice(draggedIndex, 1);
		newPages.splice(targetIndex, 0, draggedPage);

		onPageReorder(newPages.map((p) => p.id));
	};

	const handleDragEnd = () => {
		setDraggedPageId(null);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
						Manage Pages
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
					>
						<XMarkIcon className="h-5 w-5" />
					</button>
				</div>

				{/* Page list */}
				<div className="max-h-96 overflow-y-auto p-4">
					{pages.length === 0 ? (
						<div className="py-8 text-center text-gray-500 dark:text-gray-400">
							No pages yet
						</div>
					) : (
						<div className="space-y-2">
							{pages.map((page) => (
								<div
									key={page.id}
									draggable
									onDragStart={() => handleDragStart(page.id)}
									onDragOver={(e) => handleDragOver(e, page.id)}
									onDragEnd={handleDragEnd}
									className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
										draggedPageId === page.id
											? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
											: "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
									}`}
								>
									{/* Drag handle */}
									<button
										type="button"
										className="cursor-move text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
									>
										<Bars3Icon className="h-5 w-5" />
									</button>

									{/* Page info */}
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<span className="font-medium text-gray-900 dark:text-white">
												{page.name}
											</span>
											{page.id === project.home_page_id && (
												<HomeIcon className="h-4 w-4 text-blue-500" />
											)}
										</div>
										<div className="text-sm text-gray-500 dark:text-gray-400">
											/{page.slug}
										</div>
									</div>

									{/* Actions */}
									<div className="flex items-center gap-2">
										{/* Toggle publish */}
										<button
											type="button"
											onClick={() =>
												onPageUpdate(page.id, {
													is_published: !page.is_published,
												})
											}
											className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
											title={
												page.is_published ? "Unpublish page" : "Publish page"
											}
										>
											{page.is_published ? (
												<EyeIcon className="h-4 w-4" />
											) : (
												<EyeSlashIcon className="h-4 w-4" />
											)}
										</button>

										{/* Set as home */}
										{page.id !== project.home_page_id && (
											<button
												type="button"
												onClick={() => onSetHomePage(page.id)}
												className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
												title="Set as home page"
											>
												<HomeIcon className="h-4 w-4" />
											</button>
										)}

										{/* Delete */}
										{page.id !== project.home_page_id && (
											<>
												{deleteConfirm === page.id ? (
													<div className="flex gap-1">
														<button
															type="button"
															onClick={() => {
																onPageDelete(page.id);
																setDeleteConfirm(null);
															}}
															className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
														>
															Confirm
														</button>
														<button
															type="button"
															onClick={() => setDeleteConfirm(null)}
															className="rounded bg-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
														>
															Cancel
														</button>
													</div>
												) : (
													<button
														type="button"
														onClick={() => setDeleteConfirm(page.id)}
														className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
														title="Delete page"
													>
														<TrashIcon className="h-4 w-4" />
													</button>
												)}
											</>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="border-t border-gray-200 p-4 dark:border-gray-700">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Drag pages to reorder them. The home page cannot be deleted.
					</p>
				</div>
			</div>
		</div>
	);
}
