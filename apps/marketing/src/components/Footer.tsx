import Link from "next/link";
import { Container } from "@/components/Container";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 py-16">
      <Container>
        <div className="flex flex-col items-center justify-center gap-8 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-sm font-light text-slate-500">
            &copy; {new Date().getFullYear()} GoDeploy
          </p>
          <div className="flex gap-8 text-sm font-medium text-slate-600">
            <Link href="#pricing" className="transition hover:text-slate-900">
              Pricing
            </Link>
            <Link
              href="https://github.com/silvabyte/godeploy"
              className="transition hover:text-slate-900"
            >
              GitHub
            </Link>
            <Link href="/privacy" className="transition hover:text-slate-900">
              Privacy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
