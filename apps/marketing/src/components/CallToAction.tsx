import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { CheckIcon } from '@heroicons/react/24/outline'

export function CallToAction() {
  return (
    <section className="bg-slate-900 py-16">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <h2
            id="pricing-heading"
            className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Simple Pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">Start free. Upgrade when you’re ready.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900">Free</h3>
            <p className="mt-2 text-base text-slate-600">For personal projects and trials.</p>
            <p className="mt-6 text-5xl font-bold tracking-tight text-slate-900">$0</p>

            <ul className="mt-8 space-y-4 text-sm text-slate-700">
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                3 projects
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                1 custom domain included
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                GoDeploy subdomain
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                Global CDN + HTTPS (no bandwidth fees)
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                100 MB max upload per project
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                2 GB total storage included
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                Retention: last 5 deploys/project
              </li>
            </ul>

            <div className="mt-8">
              <Button href="https://auth.godeploy.app" color="green" className="w-full">
                Get Started
              </Button>
            </div>
          </div>

          {/* Pro */}
          <div className="rounded-2xl bg-white p-8 ring-2 shadow-lg ring-green-500">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Pro</h3>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                Popular
              </span>
            </div>
            <p className="mt-2 text-base text-slate-600">For teams shipping frontends at speed.</p>
            <p className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
              $49
              <span className="text-lg font-normal text-slate-600">/year</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">or $5/month</p>

            <ul className="mt-8 space-y-4 text-sm text-slate-700">
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                <strong>Unlimited</strong>
                <span className="ml-2">projects</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                <strong>Unlimited</strong>
                <span className="ml-2">custom domains</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                Global CDN + HTTPS (no bandwidth fees)
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                Previews + instant rollbacks
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                Analytics (90‑day)
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                Team members (invite users to your team)
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                100 MB max upload per project
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                10 GB total storage included
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                Storage overage: $0.20/GB‑month
              </li>
            </ul>

            <div className="mt-8">
              <Button href="https://auth.godeploy.app" color="green" className="w-full">
                Try Pro
              </Button>
              <p className="mt-2 text-center text-xs text-slate-500">
                No bandwidth fees • Storage includes deploys + previews • Manage retention
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-4xl text-center">
          <p className="text-xs text-slate-400">
            We never bill for bandwidth on static sites. Storage includes active deploys and previews.
          </p>
        </div>
      </Container>
    </section>
  )
}
