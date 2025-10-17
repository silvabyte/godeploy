import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import "./index.css";

export default function App() {
	const location = useLocation();
	const metaName = location.pathname.split("/")[1] ?? "Deployments";
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		const titleCapitalized =
			metaName.charAt(0).toUpperCase() + metaName.slice(1);
		const title =
			metaName === ""
				? "Deployments | Godeploy"
				: `${titleCapitalized} | Godeploy`;
		document.title = title;
	}, [metaName]);

	return (
		<div className="min-h-screen bg-white">
			<Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

			<div className="xl:pl-72">
				<Header setSidebarOpen={setSidebarOpen} />
				<Outlet />
			</div>
		</div>
	);
}
