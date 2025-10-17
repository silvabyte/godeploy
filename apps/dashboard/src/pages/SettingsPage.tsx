import { useEffect } from "react";
import { ComingSoonPage } from "../components/ComingSoonPage";
import { trackEvent } from "../telemetry/telemetry";

export function SettingsPage() {
	useEffect(() => {
		trackEvent("page_view", {
			page: "settings",
		});
	}, []);
	return (
		<ComingSoonPage
			title="Settings Coming Soon"
			description="Customize your deployment environment, manage team access, and configure security settings. Advanced configuration options will be available soon."
			status="planned"
		/>
	);
}
