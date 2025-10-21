import { Container } from "@/components/Container";

export function Philosophy() {
	return (
		<section className="bg-white py-32 md:py-40">
			<Container>
				<div className="mx-auto max-w-3xl">
					<p className="text-2xl font-light leading-relaxed tracking-tight text-slate-900 md:text-3xl md:leading-relaxed">
						Everyone's building deployment platforms that do everything. We built
						one that does one thing: deploy your frontend.{" "}
						<span className="text-slate-500">
							No pipelines. No edge functions. No framework lock-in.
						</span>{" "}
						<span className="text-green-600">Just shipping.</span>
					</p>
				</div>
			</Container>
		</section>
	);
}

