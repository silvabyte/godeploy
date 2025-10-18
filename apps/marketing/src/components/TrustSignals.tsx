import { Container } from "@/components/Container";

const stats = [
	{
		value: "99.99%",
		label: "Uptime SLA",
		description: "Rock-solid reliability",
	},
	{
		value: "<100ms",
		label: "Global Response Time",
		description: "Lightning fast worldwide",
	},
	{
		value: "Auto-renewed",
		label: "SSL Certificates",
		description: "Always secure",
	},
	{
		value: "$0",
		label: "Bandwidth Fees",
		description: "Unlimited traffic included",
	},
];

export function TrustSignals() {
	return (
		<section className="bg-slate-900 py-16">
			<Container>
				<div className="mx-auto max-w-7xl">
					<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
						{stats.map((stat, index) => (
							<div key={index} className="text-center">
								<div className="text-4xl font-bold text-green-400">
									{stat.value}
								</div>
								<div className="mt-2 text-base font-semibold text-white">
									{stat.label}
								</div>
								<div className="mt-1 text-sm text-slate-400">
									{stat.description}
								</div>
							</div>
						))}
					</div>
				</div>
			</Container>
		</section>
	);
}
