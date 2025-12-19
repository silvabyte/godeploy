import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { t } from "@matsilva/xtranslate";
import { Link, useLoaderData } from "react-router-dom";
import { redirectToAuth } from "../../router/redirect";
import type { AppLoaderData } from "../../services/loader.types";
import { useServices } from "../../services/ServiceProvider";
import { trackEvent } from "../../telemetry/telemetry";
import { debug } from "../../utils/debug";
import { Badge } from "../Badge";
export function UserProfile() {
	const data = useLoaderData() as AppLoaderData;
	const { authService } = useServices();

	const handleLogout = async () => {
		const error = await authService.logout();
		if (error) {
			trackEvent("logout.failure", {
				error: error.message,
			});
			debug.error(error);
			throw error; //let error page show
		}
		trackEvent("logout.success");
		redirectToAuth();
	};

	return (
		<Menu as="div" className="relative">
			{({ open }) => (
				<>
					<MenuButton
						className={`flex w-full cursor-pointer items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-slate-900 hover:bg-slate-100 ${open ? "bg-slate-100" : ""}`}
					>
						<UserCircleIcon className="size-8 text-slate-800" />
						<span className="sr-only">Your profile</span>
						<span aria-hidden="true" className="flex-1 text-left">
							{data.user.email}
						</span>
						<ChevronDownIcon
							className={`size-5 transition-transform duration-200 text-slate-500 ${open ? "rotate-180" : ""}`}
							aria-hidden="true"
						/>
					</MenuButton>

					<MenuItems
						transition
						className={`w-full absolute bottom-13 z-10 mt-2 origin-top bg-white ring-1 ring-slate-200 shadow-lg transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in`}
					>
						<div className="py-1">
							<MenuItem>
								<Link
									to="/settings"
									className={`flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900`}
								>
									<span>{t("user.profile.settings")}</span>
									<Badge status="planned" />
								</Link>
							</MenuItem>
							<MenuItem>
								<Link
									to="/subscription"
									className={`flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900`}
								>
									<span>{t("subscription.title")}</span>
									<Badge status="beta" />
								</Link>
							</MenuItem>
							{/* <MenuItem>
            <Link
              to="/support"
              className={`flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white`}
            >
              <span>{t('user.profile.support')}</span>
              <Badge status="planned" />
            </Link>
          </MenuItem> */}
							<MenuItem>
								<button
									type="button"
									onClick={handleLogout}
									className={`block cursor-pointer w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900`}
								>
									{t("user.profile.signOut")}
								</button>
							</MenuItem>
						</div>
					</MenuItems>
				</>
			)}
		</Menu>
	);
}
