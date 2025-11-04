import { useState } from "react";
import { useParams } from "react-router-dom";
import { PublishDialog } from "./components/PublishDialog";
import { GodrawEditor } from "./GodrawEditor";
import { useBuildGodraw } from "./hooks/useBuildGodraw";
import { useGodrawProject } from "./hooks/useGodrawProject";

/**
 * GoDraw Editor Page
 * Main entry point for editing GoDraw projects
 */
export function GodrawEditorPage() {
	const { projectId } = useParams<{ projectId: string }>();
	const [showPublishDialog, setShowPublishDialog] = useState(false);

	const { data, isLoading, error } = useGodrawProject(projectId!);
	const buildMutation = useBuildGodraw(projectId!);

	const handlePublish = () => {
		setShowPublishDialog(true);
	};

	const handleConfirmPublish = () => {
		buildMutation.mutate(undefined, {
			onSuccess: () => {
				// Dialog will show success state automatically
			},
			onError: (err: Error) => {
				console.error("Build failed:", err);
				// Dialog will show error state automatically
			},
		});
	};

	const handleCloseDialog = () => {
		setShowPublishDialog(false);
		buildMutation.reset();
	};

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
					<p className="text-gray-600 dark:text-gray-400">
						Loading GoDraw editor...
					</p>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<h2 className="mb-2 text-xl font-semibold text-red-600">
						Failed to load GoDraw project
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						{error instanceof Error ? error.message : "Unknown error"}
					</p>
				</div>
			</div>
		);
	}

	const { godraw_project, pages } = data;

	return (
		<>
			<GodrawEditor
				project={godraw_project}
				pages={pages}
				projectId={projectId!}
				theme={godraw_project.theme}
				onPublish={handlePublish}
			/>

			<PublishDialog
				isOpen={showPublishDialog}
				isPublishing={buildMutation.isPending}
				buildResult={buildMutation.data || null}
				error={buildMutation.error}
				onClose={handleCloseDialog}
				onPublish={handleConfirmPublish}
			/>
		</>
	);
}
