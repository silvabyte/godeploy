import { useEffect, useState } from "react";

interface TerminalLineProps {
	prompt?: string;
	command?: string;
	output?: string;
	delay?: number;
	comment?: string;
}

export const TerminalLine = ({
	prompt,
	command,
	output,
	delay = 0,
	comment,
}: TerminalLineProps) => {
	const [visible, setVisible] = useState(delay === 0);

	// Show the line after the specified delay
	useEffect(() => {
		if (delay > 0) {
			const timer = setTimeout(() => setVisible(true), delay);
			return () => clearTimeout(timer);
		}
	}, [delay]);

	if (!visible) {
		return null;
	}

	return (
		<div className="font-mono text-sm">
			{comment && <div className="ml-0 text-gray-500">{comment}</div>}
			{prompt && command && (
				<div className="flex">
					<span className="mr-2 text-green-500">{prompt}</span>
					<span className="text-white">{command}</span>
				</div>
			)}
			{output && (
				<div className="ml-0whitespace-pre-wrap text-gray-400">{output}</div>
			)}
		</div>
	);
};
