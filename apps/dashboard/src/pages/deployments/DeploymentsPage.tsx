import { useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import type { User } from "../../services/types";
import { trackEvent } from "../../telemetry/telemetry";
import { DeploymentList } from "./DeploymentList";
import { DeploymentStats } from "./DeploymentStats";
import type { Deployment } from "./deployment.types";
import { EmptyDeploymentsPage } from "./EmptyDeploymentsPage";

export const DeploymentsPage = () => {
	useEffect(() => {
		trackEvent("page_view", {
			page: "deployments",
		});
	}, []);

	const data = useLoaderData() as {
		deployments: Deployment[];
		deploymentsForChart: Deployment[];
		user: User;
	};

	if (!data?.deployments?.length) {
		return <EmptyDeploymentsPage user={data?.user} />;
	}

	return (
		<>
			<DeploymentList deployments={data?.deployments} />
			<DeploymentStats deployments={data?.deploymentsForChart} />
			{/* <ActivityFeed /> */}
		</>
	);
};
