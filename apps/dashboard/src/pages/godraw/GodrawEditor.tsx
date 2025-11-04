import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useCallback, useState } from "react";
import type {
	ExcalidrawImperativeAPI,
	ExcalidrawElement,
	AppState,
	BinaryFiles,
} from "@excalidraw/excalidraw/types";

interface GodrawEditorProps {
	projectId: string;
	pageId?: string;
	theme?: "light" | "dark";
	onSave?: (data: {
		elements: ExcalidrawElement[];
		appState: AppState;
		files: BinaryFiles;
	}) => void;
}

export function GodrawEditor({
	projectId,
	pageId,
	theme = "light",
	onSave,
}: GodrawEditorProps) {
	const [excalidrawAPI, setExcalidrawAPI] =
		useState<ExcalidrawImperativeAPI | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	// Handle changes with debouncing (auto-save)
	const handleChange = useCallback(
		(
			elements: readonly ExcalidrawElement[],
			appState: AppState,
			files: BinaryFiles,
		) => {
			// TODO: Implement debounced auto-save
			console.log("Canvas changed:", {
				elements: elements.length,
				appState,
				files: Object.keys(files).length,
			});

			if (onSave) {
				onSave({
					elements: elements as ExcalidrawElement[],
					appState,
					files,
				});
			}
		},
		[onSave],
	);

	return (
		<div className="h-screen w-full">
			<div className="flex h-full flex-col">
				{/* Top toolbar - placeholder for now */}
				<div className="flex h-14 items-center justify-between border-b bg-white px-4 dark:bg-gray-900">
					<div className="flex items-center gap-4">
						<h2 className="text-lg font-semibold">GoDraw Editor</h2>
						{isSaving && <span className="text-sm text-gray-500">Saving...</span>}
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
							onClick={() => {
								// TODO: Implement preview
								console.log("Preview clicked");
							}}
						>
							Preview
						</button>
						<button
							type="button"
							className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
							onClick={() => {
								// TODO: Implement publish
								console.log("Publish clicked");
							}}
						>
							Publish
						</button>
					</div>
				</div>

				{/* Excalidraw canvas */}
				<div className="flex-1">
					<Excalidraw
						excalidrawAPI={(api) => setExcalidrawAPI(api)}
						theme={theme}
						onChange={handleChange}
						initialData={{
							elements: [],
							appState: {
								viewBackgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
							},
						}}
						UIOptions={{
							canvasActions: {
								loadScene: false,
								export: false,
								saveAsImage: true,
							},
						}}
					/>
				</div>
			</div>
		</div>
	);
}
