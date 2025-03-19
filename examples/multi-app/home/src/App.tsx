import './App.css';
import { Logo } from './Logo';

export default function App() {
  const apps = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      description: 'View your SPA deployments and activity',
      color: 'bg-indigo-500',
    },
    {
      name: 'Auth',
      path: '/auth',
      description: 'User authentication and account management',
      color: 'bg-purple-500',
    },
  ];

  const multiAppExample = `{
  "apps": [
    { "name": "home", "source_dir": "home/dist", "path": "/" },
    { "name": "dashboard", "source_dir": "dashboard/dist", "path": "/dashboard" },
    { "name": "auth", "source_dir": "auth/dist", "path": "/auth" }
  ]
}`;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Logo className="h-32 w-auto" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">GoDeploy Multi-App Example</h1>
            <p className="mx-auto mt-3 max-w-xl text-lg text-gray-500">
              Simple, fast, and flexible deployment of multiple SPAs under one domain
            </p>
          </div>

          <div className="mt-12">
            <div className="rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:p-6 flex flex-col items-center">
                <h2 className="text-base font-semibold leading-6 text-gray-900">Multi-SPA Configuration</h2>
                <div className="mt-2 max-w-xl text-sm text-gray-500 text-center">
                  <p>
                    GoDeploy makes it easy to serve multiple SPAs under one domain with a simple configuration. This demo shows three
                    separate React applications running independently.
                  </p>
                </div>
                <div className="mt-4">
                  <pre className="rounded-md bg-gray-800 p-4 text-sm text-white overflow-auto text-left">
                    <code>{multiAppExample}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Available Apps</h2>
            <p className="mt-1 text-sm text-gray-500">Each app below is a completely separate SPA, built and deployed independently</p>
            <ul role="list" className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {apps.map((app) => (
                <li key={app.name} className="col-span-1 rounded-lg bg-white shadow">
                  <div className="flex w-full items-center justify-between space-x-6 p-6">
                    <div className="flex-1">
                      <div className="flex items-center justify-between space-x-3">
                        <h3 className="text-sm font-medium text-gray-900">{app.name}</h3>
                        <span
                          className={`inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${app.color} text-white`}
                        >
                          SPA
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 text-left">{app.description}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200">
                    <div className="flex">
                      <a
                        href={app.path}
                        className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold ${app.color} text-white`}
                      >
                        Visit {app.name}
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 rounded-lg bg-indigo-600 shadow-lg sm:mt-16 text-left">
            <div className="px-6 py-6 sm:px-8 sm:py-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Why GoDeploy for Multi-App?</h2>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-indigo-100">
                    <li>Minimal configuration to serve multiple SPAs</li>
                    <li>Zero infrastructure headaches, just ship your SPAs</li>
                    <li>HTML5 history mode routing for each app</li>
                    <li>Performance optimized with Nginx static serving</li>
                    <li>Framework agnostic - works with React, Vue, Angular, etc.</li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Quick Command Reference</h2>
                  <div className="mt-4 space-y-3 text-sm text-indigo-100">
                    <div className="rounded-md bg-indigo-800 p-2">
                      <code>godeploy init</code> - Setup initial configuration
                    </div>
                    <div className="rounded-md bg-indigo-800 p-2">
                      <code>godeploy serve</code> - Preview locally in Docker
                    </div>
                    <div className="rounded-md bg-indigo-800 p-2">
                      <code>godeploy package</code> - Create production-ready container
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
