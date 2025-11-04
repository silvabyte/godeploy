import { useParams } from "react-router-dom";
import { GodrawEditor } from "./GodrawEditor";
import { useGodrawProject } from "./hooks/useGodrawProject";

/**
 * GoDraw Editor Page
 * Main entry point for editing GoDraw projects
 */
export function GodrawEditorPage() {
	const { projectId } = useParams<{ projectId: string }>();

	const { data, isLoading, error } = useGodrawProject(projectId!);

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
					<p className="text-gray-600">Loading GoDraw editor...</p>
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
					<p className="text-gray-600">
						{error instanceof Error ? error.message : "Unknown error"}
					</p>
				</div>
			</div>
		);
	}

	const { godraw_project, pages } = data;
	const homePage = pages.find((p) => p.id === godraw_project.home_page_id);

	return (
		<GodrawEditor
			projectId={projectId!}
			pageId={homePage?.id}
			theme={godraw_project.theme}
			onSave={(data) => {
				console.log("Saving page data:", data);
				// TODO: Implement API call to save page
			}}
		/>
	);
}
