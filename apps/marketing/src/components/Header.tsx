import Link from "next/link";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";

export function Header() {
	return (
		<header className="py-8 md:py-12">
			<Container>
				<nav className="flex items-center justify-between">
					<Link href="/" aria-label="Home">
						<Logo className="h-8 w-auto md:h-10" />
					</Link>
					<Link
						href="https://auth.godeploy.app"
						className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
					>
						Sign in
					</Link>
				</nav>
			</Container>
		</header>
	);
}
