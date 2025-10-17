import Link from "next/link";

export function NavLink({
	href,
	children,
	target,
}: {
	href: string;
	children: React.ReactNode;
	target?: string;
}) {
	return (
		<Link
			target={target ?? "_self"}
			href={href}
			className="inline-block px-2 py-1 text-sm text-slate-800 transition-colors hover:text-slate-500"
		>
			{children}
		</Link>
	);
}
