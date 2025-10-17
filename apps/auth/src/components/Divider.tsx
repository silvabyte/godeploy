interface DividerProps {
	label?: string;
}

export function Divider({ label }: DividerProps) {
	return (
		<div className="relative">
			<div className="absolute inset-0 flex items-center" aria-hidden="true">
				<div className="w-full border-t border-gray-300" />
			</div>
			{label ? (
				<div className="relative flex justify-center">
					<span className="bg-white px-2 text-sm text-gray-500">{label}</span>
				</div>
			) : null}
		</div>
	);
}
