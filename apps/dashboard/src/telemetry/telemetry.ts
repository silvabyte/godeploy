import HyperDX from "@hyperdx/browser";
import type { Attributes } from "@opentelemetry/api";
import type { User } from "../services/types";

export function initTelemetry() {
	if (location.hostname === "localhost") {
		return;
	}

	HyperDX.init({
		apiKey: "18e194a3-1420-411c-ab15-d7ae79d1eb30",
		service: "godeploy-ui",
		tracePropagationTargets: [
			/api.godeploy.app/i,
			/gadyljeftebtastrldaq.supabase.co/i,
		], // Set to link traces from frontend to backend requests
		consoleCapture: true, // Capture console logs (default false)
		advancedNetworkCapture: true, // Capture full HTTP request/response headers and bodies (default false)
	});
}

export function setGlobalAttributes(user: User) {
	if (location.hostname === "localhost") {
		return;
	}

	HyperDX.setGlobalAttributes({
		userId: user.id,
		userEmail: user.email,
		tenantId: user.tenant_id,
	});
}

export function trackEvent(event: string, attributes?: Attributes) {
	if (location.hostname === "localhost") {
		return;
	}

	HyperDX.addAction(event, attributes);
}
