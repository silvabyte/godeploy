import { XMarkIcon } from "@heroicons/react/24/outline";
import { useId, useState } from "react";

interface NewPageDialogProps {
	onClose: () => void;
	onCreate: (data: { name: string; slug: string }) => void;
	existingSlugs: string[];
}

export function NewPageDialog({
	onClose,
	onCreate,
	existingSlugs,
}: NewPageDialogProps) {
	const nameId = useId();
	const slugId = useId();
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [error, setError] = useState("");
	const [autoSlug, setAutoSlug] = useState(true);

	const handleNameChange = (value: string) => {
		setName(value);
		if (autoSlug) {
			const generatedSlug = value
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");
			setSlug(generatedSlug);
		}
		setError("");
	};

	const handleSlugChange = (value: string) => {
		setSlug(value);
		setAutoSlug(false);
		setError("");
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			setError("Page name is required");
			return;
		}

		if (!slug.trim()) {
			setError("Slug is required");
			return;
		}

		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
			setError("Slug must be lowercase alphanumeric with hyphens");
			return;
		}

		if (existingSlugs.includes(slug)) {
			setError("A page with this slug already exists");
			return;
		}

		onCreate({ name: name.trim(), slug: slug.trim() });
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
						Create New Page
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
					>
						<XMarkIcon className="h-5 w-5" />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-4">
					<div className="space-y-4">
						{/* Page name */}
						<div>
							<label
								htmlFor={nameId}
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Page Name
							</label>
							<input
								id={nameId}
								type="text"
								value={name}
								onChange={(e) => handleNameChange(e.target.value)}
								placeholder="About Us"
								className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
						</div>

						{/* Slug */}
						<div>
							<label
								htmlFor={slugId}
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								URL Slug
							</label>
							<input
								id={slugId}
								type="text"
								value={slug}
								onChange={(e) => handleSlugChange(e.target.value)}
								placeholder="about-us"
								className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
							<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
								Will be available at: /{slug || "your-slug"}
							</p>
						</div>

						{/* Error */}
						{error && (
							<div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
								{error}
							</div>
						)}
					</div>

					{/* Actions */}
					<div className="mt-6 flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
						>
							Create Page
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
