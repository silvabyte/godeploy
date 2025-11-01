import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	RouteObject,
} from "react-router-dom";
import App from "../App";
import { AppErrorOutlet } from "../components/errors/AppErrorOutlet";
import { claimOfferAction } from "../components/offers/actions";
import { UnlimitedOfferPage } from "../components/offers/UnlimitedOfferPage";
import {
	SubscriptionPage,
	subscriptionAction,
	subscriptionLoader,
} from "../components/settings/SubscriptionPage";
import { FeatureFlags, FLAGS } from "../featureflags/ff";
import { DomainsPage } from "../pages/DomainsPage";
import { DeploymentsPage } from "../pages/deployments/DeploymentsPage";
import { deploymentsLoader } from "../pages/deployments/loaders";
import { domainsAction } from "../pages/domains/domains.action";
import { domainsLoader } from "../pages/domains/domains.loader";
import { ProjectDetailsPage } from "../pages/projects/details/ProjectDetailsPage";
import { projectDetailsLoader } from "../pages/projects/details/projectDetails.loader";
import {
	deleteProjectAction,
	updateProjectAction,
} from "../pages/projects/details/projects.action";
import { ProjectsPage } from "../pages/projects/ProjectsPage";
import { projectsLoader } from "../pages/projects/projects.loader";
import { SettingsPage } from "../pages/SettingsPage";
import { UsagePage } from "../pages/UsagePage";
import type { Services } from "../services/serviceInitialization";
import { debug } from "../utils/debug";
import { redirectToAuth } from "./redirect";

export const createRoutes = (services: Services): RouteObject => {
	return {
		path: "/",
		element: <App />,
		children: [
			{
				errorElement: <AppErrorOutlet />,
				children: [
					{
						index: true,
						element: <DeploymentsPage />,
						loader: async (args) => deploymentsLoader(args, services),
					},
					{
						path: "deployments",
						element: <DeploymentsPage />,
						loader: async (args) => deploymentsLoader(args, services),
					},
					{
						path: "projects",
						element: <ProjectsPage />,
						loader: async (args) => projectsLoader(args, services),
					},
					{
						path: "projects/:projectId",
						element: <ProjectDetailsPage />,
						loader: async (args) => projectDetailsLoader(args, services),
						action: async (args) => {
							if (args.request.method === "PATCH") {
								return updateProjectAction(args, services);
							}
							if (args.request.method === "PUT") {
								return updateProjectAction(args, services);
							}
							if (args.request.method === "DELETE") {
								return deleteProjectAction(args, services);
							}
							throw new Error(`Method not allowed: ${args.request.method}`);
						},
					},
					{
						path: "projects/:projectId/:tab",
						element: <ProjectDetailsPage />,
						loader: async (args) => projectDetailsLoader(args, services),
						action: async (args) => {
							if (args.request.method === "PATCH") {
								return updateProjectAction(args, services);
							}
							if (args.request.method === "PUT") {
								return updateProjectAction(args, services);
							}
							if (args.request.method === "DELETE") {
								return deleteProjectAction(args, services);
							}
							throw new Error(`Method not allowed: ${args.request.method}`);
						},
					},
					{
						path: "domains",
						element: <DomainsPage />,
						loader: async (args) => domainsLoader(args, services),
						action: async (args) => domainsAction(args, services),
					},
					{
						path: "analytics",
						element: <UsagePage />,
					},
					{
						path: "settings",
						element: <SettingsPage />,
					},
					...(FeatureFlags.getInstance().isEnabled(FLAGS.ENABLE_SUBSCRIPTIONS)
						? [
								{
									path: "subscription",
									element: <SubscriptionPage />,
									loader: async (args: LoaderFunctionArgs) =>
										subscriptionLoader(args, services),
									action: async (args: ActionFunctionArgs) =>
										subscriptionAction(args, services),
								},
							]
						: []),
					...(FeatureFlags.getInstance().isEnabled(FLAGS.ENABLE_OFFER)
						? [
								{
									path: "offer/unlimited",
									element: <UnlimitedOfferPage />,
									action: async (args: ActionFunctionArgs) =>
										claimOfferAction(args, services),
								},
							]
						: []),
				],
			},
		],
		errorElement: <AppErrorOutlet />,
		loader: async () => {
			try {
				const [error, user] = await services.userService.getCurrentUser();
				if (error || !user) {
					debug.error(error || new Error("User not found"));
					return redirectToAuth();
				}
				return { user };
			} catch (error) {
				debug.error(error as Error);
				return redirectToAuth();
			}
		},
	};
};
