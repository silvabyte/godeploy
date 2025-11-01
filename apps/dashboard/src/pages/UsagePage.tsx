import { useEffect } from "react";
import { ComingSoonPage } from "../components/ComingSoonPage";
import { trackEvent } from "../telemetry/telemetry";

export function UsagePage() {
	useEffect(() => {
		trackEvent("page_view", {
			page: "usage",
		});
	}, []);
	return (
		<ComingSoonPage
			title="Analytics Coming Soon"
			description="Track your deployment metrics, resource usage, and performance insights. Get detailed analytics and optimize your deployments with our upcoming usage monitoring features."
			status="planned"
		/>
	);
}
