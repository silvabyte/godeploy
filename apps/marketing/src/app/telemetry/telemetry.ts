import HyperDX from "@hyperdx/browser";
import type { Attributes } from "@opentelemetry/api";

export function initTelemetry(opts?: {
	consoleCapture?: boolean;
	advancedNetworkCapture?: boolean;
}) {
	if (location.hostname === "localhost") {
		return;
	}

	HyperDX.init({
		apiKey: "18e194a3-1420-411c-ab15-d7ae79d1eb30",
		service: "godeploy-landing-fe-dev",
		tracePropagationTargets: [
			/api.godeploy.app/i,
			/gadyljeftebtastrldaq.supabase.co/i,
		], // Set to link traces from frontend to backend requests
		consoleCapture: !!opts?.consoleCapture, // Capture console logs (default false)
		advancedNetworkCapture: !!opts?.advancedNetworkCapture, // Capture full HTTP request/response headers and bodies (default false)
	});
}

export function trackEvent(event: string, attributes?: Attributes) {
	if (location.hostname === "localhost") {
		return;
	}

	HyperDX.addAction(event, attributes);
}
