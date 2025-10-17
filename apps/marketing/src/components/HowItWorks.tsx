import { Container } from '@/components/Container'
import { Terminal } from '@/components/Terminal'
import { TerminalLine } from '@/components/TerminalLines'
import { Potatosaur } from '@/components/Potatosaur'

export function HowItWorks() {
  // CLI-only instructions

  return (
    <section className="bg-white py-24">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <h2
            id="how-it-works-heading"
            className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
          >
            How It Works
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-700">
            Sign up and deploy using the GoDeploy CLI.
          </p>
        </div>

        <div className="relative mx-auto mt-16 max-w-4xl">
          <div
            className="pointer-events-none absolute -top-6 -right-6 w-24 rotate-6 opacity-95"
            aria-hidden="true"
          >
            <Potatosaur />
          </div>
          <Terminal className="mt-6" title="CLI Quickstart">
            <TerminalLine
              prompt="$"
              command="curl -sSL https://install.spa.godeploy.app/now.sh | bash"
            />
            <TerminalLine prompt="$" command="godeploy auth sign-up" />
            <TerminalLine prompt="$" command="godeploy init" />
            <TerminalLine prompt="$" command="npm run build" />
            <TerminalLine prompt="$" command="godeploy deploy" />
          </Terminal>
        </div>

        <div className="mx-auto mt-12 max-w-7xl">
          <div className="grid grid-cols-1 gap-8">
            <figure className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
              <img
                src="/images/projects.png"
                alt="Projects overview with status and project metrics"
                className="h-auto w-full"
                loading="lazy"
              />
              <figcaption className="px-4 py-3 text-center text-sm text-slate-600">
                Projects overview — active projects and activity metrics
              </figcaption>
            </figure>
            <figure className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
              <img
                src="/images/deployments.png"
                alt="Deployments list showing recent deploys and metrics"
                className="h-auto w-full"
                loading="lazy"
              />
              <figcaption className="px-4 py-3 text-center text-sm text-slate-600">
                Deployments — recent deploys with success rate and timings
              </figcaption>
            </figure>
            <figure className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
              <img
                src="/images/project_details.png"
                alt="Project details with latest deploys, success rate, and averages"
                className="h-auto w-full"
                loading="lazy"
              />
              <figcaption className="px-4 py-3 text-center text-sm text-slate-600">
                Project details — latest deploys, success rate, and averages
              </figcaption>
            </figure>
          </div>
        </div>
      </Container>
    </section>
  )
}
