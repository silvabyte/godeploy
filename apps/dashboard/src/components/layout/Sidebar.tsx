import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Logo } from "../../Logo";
import { NavigationList } from "./NavigationList";
// import { TeamList } from './TeamList';
import { UserProfile } from "./UserProfile";

interface SidebarProps {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
	return (
		<>
			{/* Mobile sidebar */}
			<Dialog
				open={sidebarOpen}
				onClose={setSidebarOpen}
				className="relative z-50 xl:hidden"
			>
				<DialogBackdrop
					transition
					className="fixed inset-0 bg-slate-900/20 transition-opacity duration-300 ease-linear data-closed:opacity-0"
				/>

				<div className="fixed inset-0 ml-2 flex">
					<DialogPanel
						transition
						className="flex flex-col bg-white w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
					>
						<TransitionChild>
							<div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
								<button
									type="button"
									onClick={() => setSidebarOpen(false)}
									className="-m-2.5 p-2.5"
								>
									<span className="sr-only">Close sidebar</span>
									<XMarkIcon
										aria-hidden="true"
										className="size-6 text-slate-900"
									/>
								</button>
							</div>
						</TransitionChild>
						<SidebarContent />
					</DialogPanel>
				</div>
			</Dialog>

			{/* Desktop sidebar */}
			<div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
				<div className="flex grow flex-col gap-y-8 overflow-y-auto bg-white px-8 py-8 border-r border-slate-100">
					<SidebarContent />
				</div>
			</div>
		</>
	);
}

function SidebarContent() {
	return (
		<>
			<a href="/" className="flex items-center">
				<Logo className="h-10" />
			</a>
			<nav className="flex flex-1 flex-col">
				<ul className="flex flex-1 flex-col gap-y-8">
					<li>
						<NavigationList />
					</li>
					{/* <li>
            <TeamList />
          </li> */}
					<li className="-mx-8 mt-auto">
						<UserProfile />
					</li>
				</ul>
			</nav>
		</>
	);
}
