import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { t } from "@matsilva/xtranslate";
import { Fragment, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { useCreateGodrawProject } from "./hooks/useCreateGodrawProject";

interface NewGodrawProjectDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export function NewGodrawProjectDialog({
	isOpen,
	onClose,
}: NewGodrawProjectDialogProps) {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [theme, setTheme] = useState<"light" | "dark">("light");

	const nameId = useId();
	const descriptionId = useId();
	const themeId = useId();

	const createMutation = useCreateGodrawProject();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			return;
		}

		try {
			const result = await createMutation.mutateAsync({
				name: name.trim(),
				description: description.trim() || undefined,
				theme,
			});

			// Navigate to the GoDraw editor
			navigate(`/projects/${result.project.id}/godraw/editor`);

			// Reset form and close
			setName("");
			setDescription("");
			setTheme("light");
			onClose();
		} catch (error) {
			console.error("Failed to create GoDraw project:", error);
		}
	};

	const handleClose = () => {
		if (!createMutation.isPending) {
			setName("");
			setDescription("");
			setTheme("light");
			onClose();
		}
	};

	return (
		<Transition show={isOpen} as={Fragment}>
			<Dialog onClose={handleClose} className="relative z-50">
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
				</TransitionChild>

				<div className="fixed inset-0 flex items-center justify-center p-4">
					<TransitionChild
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<DialogPanel className="mx-auto w-full max-w-md border border-slate-200 bg-white p-6">
							<DialogTitle className="mb-6 text-xl font-light text-slate-900">
								{t("projects.newGodrawProject")}
							</DialogTitle>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label
										htmlFor={nameId}
										className="block text-sm font-light text-slate-700 mb-1"
									>
										{t("projects.godrawDialog.name")}
									</label>
									<input
										id={nameId}
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="w-full border border-slate-200 px-3 py-2 text-sm font-light focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
										placeholder={t("projects.godrawDialog.namePlaceholder")}
										autoFocus
										disabled={createMutation.isPending}
									/>
								</div>

								<div>
									<label
										htmlFor={descriptionId}
										className="block text-sm font-light text-slate-700 mb-1"
									>
										{t("projects.godrawDialog.description")}
									</label>
									<textarea
										id={descriptionId}
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										className="w-full border border-slate-200 px-3 py-2 text-sm font-light focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
										placeholder={t(
											"projects.godrawDialog.descriptionPlaceholder",
										)}
										rows={3}
										disabled={createMutation.isPending}
									/>
								</div>

								<div>
									<label
										htmlFor={themeId}
										className="block text-sm font-light text-slate-700 mb-1"
									>
										{t("projects.godrawDialog.theme")}
									</label>
									<select
										id={themeId}
										value={theme}
										onChange={(e) =>
											setTheme(e.target.value as "light" | "dark")
										}
										className="w-full border border-slate-200 px-3 py-2 text-sm font-light focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
										disabled={createMutation.isPending}
									>
										<option value="light">
											{t("projects.godrawDialog.themeLight")}
										</option>
										<option value="dark">
											{t("projects.godrawDialog.themeDark")}
										</option>
									</select>
								</div>

								{createMutation.isError && (
									<div className="text-sm font-light text-red-600">
										{t("projects.godrawDialog.error")}
									</div>
								)}

								<div className="flex justify-end gap-3 pt-4">
									<Button
										type="button"
										variant="secondary"
										onClick={handleClose}
										disabled={createMutation.isPending}
									>
										{t("common.cancel")}
									</Button>
									<Button
										type="submit"
										variant="primary"
										color="green"
										disabled={!name.trim() || createMutation.isPending}
									>
										{createMutation.isPending
											? t("projects.godrawDialog.creating")
											: t("projects.godrawDialog.create")}
									</Button>
								</div>
							</form>
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</Transition>
	);
}
