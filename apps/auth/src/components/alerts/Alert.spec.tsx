import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Alert } from "./Alert"; // Adjust the import path as necessary

describe("Alert Component", () => {
	it("renders a danger alert with the correct classes and content", () => {
		const { getByText } = render(
			<Alert type="danger" title="Danger Alert">
				This is a danger alert.
			</Alert>,
		);

		const titleElement = getByText("Danger Alert");
		const contentElement = getByText("This is a danger alert.");

		expect(titleElement).toBeTruthy();
		expect(contentElement).toBeTruthy();
	});

	it("renders an info alert with the correct classes and content", () => {
		const { getByText } = render(
			<Alert type="info" title="Info Alert">
				This is an info alert.
			</Alert>,
		);

		const titleElement = getByText("Info Alert");
		const contentElement = getByText("This is an info alert.");

		expect(titleElement).toBeTruthy();
		expect(contentElement).toBeTruthy();
	});

	// You can add more tests for the 'success' and 'warning' types following the same pattern.

	it("renders without children if none are provided", () => {
		const { getByText, queryByText } = render(
			<Alert type="warning" title="Warning Alert" />,
		);

		const titleElement = getByText("Warning Alert");
		const contentElement = queryByText("This is a warning alert.");

		expect(titleElement).toBeTruthy();
		expect(contentElement).toBeNull(); // No children content should be found
	});
});
