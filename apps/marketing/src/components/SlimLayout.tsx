import Image from "next/image";

export function SlimLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<div className="relative flex min-h-full shrink-0 justify-center md:px-12 lg:px-0">
				<div className="relative z-10 flex flex-1 flex-col bg-white px-4 py-10 shadow-2xl sm:justify-center md:flex-none md:px-28">
					<main className="mx-auto w-full max-w-md sm:px-4 md:w-96 md:max-w-sm md:px-0">
						{children}
					</main>
				</div>
				<div className="hidden sm:contents lg:relative lg:block lg:flex-1">
					<div
						className="absolute inset-0 h-full w-full bg-gradient-to-br from-green-700 via-green-600 to-green-500"
						style={{
							backgroundImage:
								"radial-gradient(circle at top left, rgba(240, 253, 244, 0.3), transparent 400px), linear-gradient(135deg, #16A34A, #22C55E, #4ADE80)",
						}}
					/>
				</div>
			</div>
		</>
	);
}
