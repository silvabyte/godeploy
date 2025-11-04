import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type {
	AppState,
	BinaryFiles,
	ExcalidrawElement,
	ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import {
	Bars3Icon,
	CheckCircleIcon,
	ClockIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { NewPageDialog } from "./components/NewPageDialog";
import { PageManager } from "./components/PageManager";
import { PageSelector } from "./components/PageSelector";
import { useAutoSave } from "./hooks/useAutoSave";
import {
	useCreatePage,
	useDeletePage,
	useReorderPages,
	useUpdateAnyPage,
	useUpdatePage,
} from "./hooks/useGodrawPages";
import type { GodrawPage, GodrawProject } from "./hooks/useGodrawProject";

interface GodrawEditorProps {
	project: GodrawProject;
	pages: GodrawPage[];
	projectId: string;
	theme?: "light" | "dark";
	onPublish?: () => void;
}

export function GodrawEditor({
	project,
	pages,
	projectId,
	theme = "light",
	onPublish,
}: GodrawEditorProps) {
	const [excalidrawAPI, setExcalidrawAPI] =
		useState<ExcalidrawImperativeAPI | null>(null);
	const [currentPage, setCurrentPage] = useState<GodrawPage | null>(null);
	const [showPageManager, setShowPageManager] = useState(false);
	const [showNewPageDialog, setShowNewPageDialog] = useState(false);

	// Set initial page (home page or first page)
	useEffect(() => {
		if (pages.length > 0 && !currentPage) {
			const homePage = pages.find((p) => p.id === project.home_page_id);
			setCurrentPage(homePage || pages[0]);
		}
	}, [pages, currentPage, project.home_page_id]);

	// API mutations
	const updatePageMutation = useUpdatePage(projectId, currentPage?.id || "");
	const updateAnyPageMutation = useUpdateAnyPage(projectId);
	const createPageMutation = useCreatePage(projectId);
	const deletePageMutation = useDeletePage(projectId);
	const reorderPagesMutation = useReorderPages(projectId);

	// Auto-save hook
	const { save, isSaving, hasUnsavedChanges, lastSaved } = useAutoSave({
		onSave: async (data: {
			elements: ExcalidrawElement[];
			appState: AppState;
			files: BinaryFiles;
		}) => {
			if (!currentPage) return;

			await updatePageMutation.mutateAsync({
				elements: data.elements as unknown[],
				app_state: data.appState as Record<string, unknown>,
				files: data.files as Record<string, unknown>,
			});
		},
		delay: 2000,
		enabled: !!currentPage,
	});

	// Handle canvas changes
	const handleChange = useCallback(
		(
			elements: readonly ExcalidrawElement[],
			appState: AppState,
			files: BinaryFiles,
		) => {
			save({
				elements: elements as ExcalidrawElement[],
				appState,
				files,
			});
		},
		[save],
	);

	// Switch to a different page
	const handlePageChange = useCallback(
		(page: GodrawPage) => {
			setCurrentPage(page);

			// Update Excalidraw canvas with new page data
			if (excalidrawAPI) {
				excalidrawAPI.updateScene({
					elements: page.elements as ExcalidrawElement[],
					appState: page.app_state as Partial<AppState>,
				});

				// TODO: Load files
			}
		},
		[excalidrawAPI],
	);

	// Create new page
	const handleCreatePage = useCallback(
		async (data: { name: string; slug: string }) => {
			const newPage = await createPageMutation.mutateAsync(data);
			setShowNewPageDialog(false);
			handlePageChange(newPage as GodrawPage);
		},
		[createPageMutation, handlePageChange],
	);

	// Delete page
	const handleDeletePage = useCallback(
		async (pageId: string) => {
			await deletePageMutation.mutateAsync(pageId);
			// Switch to home page after deletion
			const homePage = pages.find((p) => p.id === project.home_page_id);
			if (homePage && currentPage?.id === pageId) {
				handlePageChange(homePage);
			}
		},
		[
			deletePageMutation,
			pages,
			project.home_page_id,
			currentPage,
			handlePageChange,
		],
	);

	// Update page (for publish toggle, etc.)
	const handlePageUpdate = useCallback(
		async (pageId: string, data: { is_published?: boolean }) => {
			const page = pages.find((p) => p.id === pageId);
			if (!page) return;

			await updateAnyPageMutation.mutateAsync({ pageId, data });
		},
		[pages, updateAnyPageMutation],
	);

	// Reorder pages
	const handlePageReorder = useCallback(
		async (pageIds: string[]) => {
			await reorderPagesMutation.mutateAsync(pageIds);
		},
		[reorderPagesMutation],
	);

	// Set home page
	const handleSetHomePage = useCallback(async (pageId: string) => {
		// TODO: Update godraw_project.home_page_id via API
		console.log("Set home page:", pageId);
	}, []);

	// Format last saved time
	const formatLastSaved = (date: Date | null) => {
		if (!date) return "";
		const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
		if (seconds < 5) return "Saved just now";
		if (seconds < 60) return `Saved ${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `Saved ${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		return `Saved ${hours}h ago`;
	};

	return (
		<div className="h-screen w-full">
			<div className="flex h-full flex-col">
				{/* Top toolbar */}
				<div className="flex h-14 items-center justify-between border-b bg-white px-4 dark:bg-gray-900">
					<div className="flex items-center gap-4">
						{/* Page selector */}
						<PageSelector
							pages={pages}
							currentPage={currentPage}
							onPageChange={handlePageChange}
							onNewPage={() => setShowNewPageDialog(true)}
						/>

						{/* Page manager button */}
						<button
							type="button"
							onClick={() => setShowPageManager(true)}
							className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
							title="Manage pages"
						>
							<Bars3Icon className="h-5 w-5" />
						</button>

						{/* Save status */}
						<div className="flex items-center gap-2 text-sm">
							{isSaving ? (
								<>
									<ClockIcon className="h-4 w-4 animate-spin text-blue-500" />
									<span className="text-gray-500 dark:text-gray-400">
										Saving...
									</span>
								</>
							) : hasUnsavedChanges ? (
								<>
									<ClockIcon className="h-4 w-4 text-yellow-500" />
									<span className="text-gray-500 dark:text-gray-400">
										Unsaved changes
									</span>
								</>
							) : lastSaved ? (
								<>
									<CheckCircleIcon className="h-4 w-4 text-green-500" />
									<span className="text-gray-500 dark:text-gray-400">
										{formatLastSaved(lastSaved)}
									</span>
								</>
							) : null}
						</div>
					</div>

					<div className="flex items-center gap-2">
						<button
							type="button"
							className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
							onClick={() => {
								// TODO: Implement preview
								console.log("Preview clicked");
							}}
						>
							Preview
						</button>
						<button
							type="button"
							className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
							onClick={() => {
								if (onPublish) {
									onPublish();
								} else {
									// TODO: Implement publish
									console.log("Publish clicked");
								}
							}}
						>
							Publish
						</button>
					</div>
				</div>

				{/* Excalidraw canvas */}
				<div className="flex-1">
					{currentPage ? (
						<Excalidraw
							excalidrawAPI={(api) => setExcalidrawAPI(api)}
							theme={theme}
							onChange={handleChange}
							initialData={{
								elements: currentPage.elements as ExcalidrawElement[],
								appState: {
									...currentPage.app_state,
									viewBackgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
								} as Partial<AppState>,
							}}
							UIOptions={{
								canvasActions: {
									loadScene: false,
									export: false,
									saveAsImage: true,
								},
							}}
						/>
					) : (
						<div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
							No page selected
						</div>
					)}
				</div>
			</div>

			{/* Page manager modal */}
			{showPageManager && (
				<PageManager
					project={project}
					pages={pages}
					onClose={() => setShowPageManager(false)}
					onPageUpdate={handlePageUpdate}
					onPageDelete={handleDeletePage}
					onPageReorder={handlePageReorder}
					onSetHomePage={handleSetHomePage}
				/>
			)}

			{/* New page dialog */}
			{showNewPageDialog && (
				<NewPageDialog
					onClose={() => setShowNewPageDialog(false)}
					onCreate={handleCreatePage}
					existingSlugs={pages.map((p) => p.slug)}
				/>
			)}
		</div>
	);
}
