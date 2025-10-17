import type { ActionFunctionArgs } from "react-router-dom";
import type { Services } from "../../services/serviceInitialization";

export const domainsAction = async (
	args: ActionFunctionArgs,
	services: Services,
) => {
	const data = await args.request.formData();
	const domain = (data.get("domain") as string | null)?.trim();
	if (!domain) {
		return { error: "Please enter a domain to validate" };
	}

	// Run DNS validation and availability if authenticated
	try {
		const validation = await services.domainService.validateDomain(domain);
		if (!validation.isValid) {
			return {
				error:
					validation.error ||
					`CNAME points to ${validation.cnameRecord || "(unknown)"} but must match the platform target`,
				cnameRecord: validation.cnameRecord,
			};
		}

		const availability = await services.domainService.checkAvailability(domain);
		if (!availability.available) {
			return { error: availability.reason || "Domain is not available" };
		}

		return {
			success: "Domain DNS is valid and available to assign",
			cnameValid: true,
		};
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : "Failed to validate domain",
		};
	}
};
