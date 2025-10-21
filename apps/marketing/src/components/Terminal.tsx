import clsx from "clsx";
import { type ReactNode, useEffect, useState } from "react";

interface Command {
	command: string;
	output?: string;
	delay?: number;
}

interface TerminalProps {
	commands?: Command[];
	children?: ReactNode;
	className?: string;
	title?: string;
}

export function Terminal({
	commands,
	children,
	className = "mt-6",
	title = "Terminal",
}: TerminalProps) {
	// If children are provided, render the simple terminal
	if (children) {
		return (
			<div className={className}>
				<div className="h-48 w-full overflow-hidden rounded-lg bg-gray-900 p-4 text-white">
					<div className="mb-3 flex items-center">
						<div className="flex space-x-2">
							<div className="h-3 w-3 rounded-full bg-red-500"></div>
							<div className="h-3 w-3 rounded-full bg-yellow-500"></div>
							<div className="h-3 w-3 rounded-full bg-green-500"></div>
						</div>
						<div className="ml-2 text-xs text-gray-400">{title}</div>
					</div>

					<div className="space-y-2 text-left">{children}</div>
				</div>
			</div>
		);
	}

	// Original animated terminal implementation
	const [visibleCommands, setVisibleCommands] = useState<number>(0);
	const [visibleOutputs, setVisibleOutputs] = useState<boolean[]>(
		Array(commands?.length || 0).fill(false),
	);
	const [isTyping, setIsTyping] = useState<boolean>(false);
	const [currentText, setCurrentText] = useState<string>("");
	const [currentCommandIndex, setCurrentCommandIndex] = useState<number>(0);

	// Reset animation when commands change (e.g., when tab changes)
	useEffect(() => {
		setVisibleCommands(0);
		setVisibleOutputs(Array(commands?.length || 0).fill(false));
		setIsTyping(false);
		setCurrentText("");
		setCurrentCommandIndex(0);
	}, [commands]);

	// Handle typing animation
	useEffect(() => {
		if (!commands) return;

		if (visibleCommands < commands.length) {
			const currentCommand = commands[visibleCommands].command;

			if (currentText.length < currentCommand.length) {
				setIsTyping(true);
				const timer = setTimeout(() => {
					setCurrentText(currentCommand.substring(0, currentText.length + 1));
				}, 50); // Typing speed
				return () => clearTimeout(timer);
			} else {
				setIsTyping(false);
				setCurrentCommandIndex(visibleCommands);
				const timer = setTimeout(() => {
					setVisibleCommands(visibleCommands + 1);
					setCurrentText("");
				}, commands[visibleCommands]?.delay || 500);
				return () => clearTimeout(timer);
			}
		}
	}, [visibleCommands, currentText, commands]);

	// Handle output display
	useEffect(() => {
		if (!commands) return;

		if (currentCommandIndex >= 0 && currentCommandIndex < commands.length) {
			if (
				commands[currentCommandIndex].output &&
				!visibleOutputs[currentCommandIndex]
			) {
				const timer = setTimeout(() => {
					setVisibleOutputs((prev) => {
						const newOutputs = [...prev];
						newOutputs[currentCommandIndex] = true;
						return newOutputs;
					});
				}, 300);
				return () => clearTimeout(timer);
			}
		}
	}, [currentCommandIndex, commands, visibleOutputs]);

	return (
		<div
			className={clsx(
				"overflow-hidden rounded-xl bg-slate-900 shadow-xl",
				className,
			)}
		>
			{/* Terminal header */}
			<div className="flex items-center justify-between bg-slate-800 px-4 py-2">
				<div className="flex space-x-2">
					<div className="h-3 w-3 rounded-full bg-red-500"></div>
					<div className="h-3 w-3 rounded-full bg-yellow-500"></div>
					<div className="h-3 w-3 rounded-full bg-green-500"></div>
				</div>
				<div className="text-xs font-medium text-slate-400">{title}</div>
				<div className="w-16"></div> {/* Spacer for balance */}
			</div>

			{/* Terminal content */}
			<div className="max-h-[400px] min-h-[300px] overflow-auto p-4 font-mono text-sm text-slate-300 sm:min-h-[350px] md:min-h-[400px]">
				{commands?.slice(0, visibleCommands).map((cmd, index) => (
					<div key={index} className="mb-4">
						<div className="flex">
							<span className="mr-2 text-green-400">$</span>
							<span className="text-white">{cmd.command}</span>
						</div>
						{cmd.output && visibleOutputs[index] && (
							<div className="mt-1 ml-1 border-l border-slate-700 pl-4 whitespace-pre-wrap text-slate-400">
								{cmd.output}
							</div>
						)}
					</div>
				))}

				{/* Current typing command */}
				{commands && visibleCommands < commands.length && (
					<div className="mb-4">
						<div className="flex">
							<span className="mr-2 text-green-400">$</span>
							<span className="text-white">{currentText}</span>
							<span
								className={`ml-0.5 inline-block h-4 w-2 bg-slate-400 ${isTyping ? "animate-pulse" : ""}`}
							></span>
						</div>
					</div>
				)}

				{/* Cursor at the end */}
				{commands && visibleCommands === commands.length && (
					<div className="flex">
						<span className="mr-2 text-green-400">$</span>
						<span className="inline-block h-4 w-2 animate-pulse bg-slate-400"></span>
					</div>
				)}
			</div>
		</div>
	);
}
