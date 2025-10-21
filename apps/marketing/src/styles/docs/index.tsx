import Link from "next/link";
import { ComponentExamples } from "./components";

export default function StyleguidePage() {
	return (
		<div className="bg-white">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between border-b border-slate-200 py-6">
					<div className="flex items-center">
						<Link
							href="/"
							className="flex items-center font-semibold text-slate-900 hover:text-slate-700"
						>
							<svg
								className="mr-2 h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
									clipRule="evenodd"
								/>
							</svg>
							Back to Home
						</Link>
					</div>
					{/* <div>
            <Link
              href="/styles/docs/styleguide.mdx"
              className="font-medium text-green-500 hover:text-green-600"
              target="_blank"
            >
              View Full Documentation
            </Link>
          </div> */}
				</div>

				<div className="py-16">
					<div className="mx-auto max-w-3xl text-center">
						<h1 className="text-5xl font-bold tracking-tight text-slate-900">
							GoDeploy Style Guide
						</h1>
						<p className="mt-6 text-xl text-slate-700">
							A comprehensive guide to our design system
						</p>
					</div>

					<div className="mt-16">
						<ComponentExamples />
					</div>
				</div>
			</div>
		</div>
	);
}
