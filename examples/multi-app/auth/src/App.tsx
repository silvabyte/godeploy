import './App.css';
import { LogoIcon } from './Logo';

export default function App() {
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex justify-center">
            <a href="/">
              <LogoIcon className="h-32 w-auto" />
            </a>
          </div>
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Sign in to GoDeploy</h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            action="#"
            method="POST"
            className="space-y-6"
            onSubmit={() =>
              alert(
                atob(
                  '8J+MqSBZb3UgZm91bmQgYW4gRWFzdGVyIGVnZyEg8J+MqQ0KDQpUaGUgZmlyc3QgMTAgcGVvcGxlIHRvIGVtYWlsIG1hdEBzaWx2YWJ5dGUuY29tIHdpdGggdGhlIHN1YmplY3Q6DQoNCiIxIHllYXIgZnJlZSBvZiBHb0RlcGxveSINCg0Kd2lsbCByZWNlaXZlIGEgZnJlZSB5ZWFyIG9mIEdvRGVwbG95ISBEb24ndCB3YWl0IQ=='
                )
              )
            }
          >
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            New to GoDeploy?{' '}
            <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Create an account for instant SPA hosting
            </a>
          </p>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-center text-sm/6 text-gray-500">🚀 Effortless SPA packaging & deployment</p>
            <p className="mt-2 text-center text-xs text-gray-500">No SSR. No infrastructure headaches. Just ship.</p>
          </div>
        </div>
      </div>
    </>
  );
}
