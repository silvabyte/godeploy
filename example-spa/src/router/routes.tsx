import { LoaderFunctionArgs, createBrowserRouter, redirect } from 'react-router-dom';
import SessionLogin, { LOGIN_ACTION_PATH, createLoginAction } from '../routes/session/SessionLogin';
import SessionVerify from '../routes/session/SessionVerify';
import SessionAuthenticate, {
  SessionAuthenticateLoaderResponse,
  createSessionAuthenticateLoader,
} from '../routes/session/SessionAuthenticate';
import { AppErrorOutlet } from '../errors/AppErrorOutlet';
import { createRedirectToApp } from './redirectUtils';
import { AuthService } from '../auth/auth';

/**
 * Creates a router configuration with the provided AuthService
 */
export function createRouter(authService: AuthService) {
  // Create authentication-related functions with the auth service
  const redirectToApp = createRedirectToApp(authService);
  const loginAction = createLoginAction(authService);
  const sessionAuthenticateLoader = createSessionAuthenticateLoader(authService);

  // Common error element used across routes
  const commonErrorElement = <AppErrorOutlet />;

  // Create and return the router configuration
  return createBrowserRouter([
    {
      path: '/',
      element: <SessionLogin />,
      errorElement: commonErrorElement,
      loader: async () => {
        return await redirectToApp();
      },
    },
    {
      path: '/verify',
      element: <SessionVerify />,
      errorElement: commonErrorElement,
      loader: async () => {
        return await redirectToApp();
      },
    },
    {
      path: '/authenticate',
      element: <SessionAuthenticate />,
      errorElement: commonErrorElement,
      loader: async (lfa: LoaderFunctionArgs) => {
        return await redirectToApp<Promise<SessionAuthenticateLoaderResponse | Response>>(
          sessionAuthenticateLoader.bind(null, lfa),
        );
      },
    },
    {
      path: '/api/ui/v1/session/logout',
      element: null,
      errorElement: commonErrorElement,
      loader: async () => {
        await authService.logout();
        return redirect('/');
      },
    },
    {
      path: LOGIN_ACTION_PATH,
      element: null,
      errorElement: commonErrorElement,
      action: loginAction,
    },
  ]);
}
