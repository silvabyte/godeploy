import { Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import debounce from "debounce";
import { useNavigate } from "react-router-dom";
import { popQueryParam, pushQueryParam } from "../../utils/navigate";

interface HeaderProps {
	setSidebarOpen: (open: boolean) => void;
}

export function Header({ setSidebarOpen }: HeaderProps) {
	const navigate = useNavigate();
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value?.trim();
		if (value) {
			navigate(pushQueryParam("q", value));
		} else {
			navigate(popQueryParam("q"));
		}
	};

	const url = new URL(window.location.href);
	//TODO: make this specific to each page, deployments and home for example use the deployment search
	// if (url.pathname !== '/deployments' && url.pathname !== '/') return null;
	const isDeploymentsPage =
		url.pathname === "/deployments" || url.pathname === "/";

	return (
		<div
			className={`${isDeploymentsPage ? "sticky" : ""} top-0 z-40 flex h-20 shrink-0 items-center gap-x-6 border-b border-slate-100 bg-white px-6 sm:px-8 lg:px-12`}
		>
			{isDeploymentsPage && (
				<>
					<button
						type="button"
						onClick={() => setSidebarOpen(true)}
						className="-m-2.5 p-2.5 text-slate-500 hover:text-slate-900 transition xl:hidden"
					>
						<span className="sr-only">Open sidebar</span>
						<Bars3Icon aria-hidden="true" className="size-5" />
					</button>

					<div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
						<form
							action={`/deployments?${url.search}`}
							method="GET"
							onSubmit={(e) => {
								e.preventDefault();
							}}
							className="grid flex-1 grid-cols-1"
						>
							<input
								name="search"
								type="search"
								placeholder="Search..."
								onChange={debounce(onChange, 300)}
								defaultValue={url.searchParams.get("q") ?? ""}
								aria-label="Search"
								className="col-start-1 row-start-1 block size-full border-0 border-b border-transparent bg-transparent pl-8 text-base font-light text-slate-900 outline-hidden placeholder:text-slate-400 focus:border-green-500 sm:text-sm/6"
							/>
							<MagnifyingGlassIcon
								aria-hidden="true"
								className="pointer-events-none col-start-1 row-start-1 size-5 self-center text-slate-400"
							/>
						</form>
					</div>
				</>
			)}
		</div>
	);
}
