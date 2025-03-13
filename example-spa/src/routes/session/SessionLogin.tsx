import {
  ActionFunctionArgs,
  redirect,
  useFetcher,
  useNavigation,
  useLocation,
} from 'react-router-dom';
import { t } from '@matsilva/xtranslate';
import { Alert } from '@matsilva/xcomponents';
import { AppButton } from '@matsilva/xcomponents';
import { Logo } from '../../logo/Logo';
import { useEffect, useState } from 'react';
import {
  DEEP_LINK_PROTOCOL,
  REDIRECT_URL_PARAM,
  REDIRECT_URL_STORAGE_KEY,
} from '../../constants/deepLinkConstants';
import { AuthService } from '../../auth/auth';

export const LOGIN_ACTION_PATH = '/api/ui/v1/session/login';

/**
 * Creates a login action function with the provided AuthService
 */
export function createLoginAction(authService: AuthService) {
  return async function loginAction({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    const email = form.get('email') as string;
    const redirectUrlValue = form.get(REDIRECT_URL_PARAM);
    const redirectUrl = redirectUrlValue ? redirectUrlValue.toString() : undefined;

    const { error } = await authService.signInWithEmail(email, redirectUrl);

    if (error) {
      return { error: error };
    }

    // Redirect to verify on success
    return redirect('/verify/');
  };
}

export default function Login() {
  const nav = useNavigation();
  const fetcher = useFetcher();
  const { error } = fetcher.data || { error: null };
  const location = useLocation();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Capture redirect URL from query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const redirectUrlParam = searchParams.get(REDIRECT_URL_PARAM);

    // Store the redirect URL in localStorage and state if it's a valid audetic:// URL
    if (redirectUrlParam && redirectUrlParam.startsWith(DEEP_LINK_PROTOCOL)) {
      localStorage.setItem(REDIRECT_URL_STORAGE_KEY, redirectUrlParam);
      setRedirectUrl(redirectUrlParam);
    }
  }, [location]);

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="mt-6 text-center text-2xl font-light leading-9 tracking-wider text-gray-900">
          {t('session.signin.title')}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          {error ? <Alert type="danger" title={error.message} /> : null}
          <fetcher.Form
            id="session-submit"
            className="space-y-6"
            method="POST"
            action={LOGIN_ACTION_PATH}
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                {t('session.inputs.email.label')}
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('session.inputs.email.placeholder')}
                  required
                  className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Hidden input for redirect URL */}
            {redirectUrl && <input type="hidden" name={REDIRECT_URL_PARAM} value={redirectUrl} />}

            <div>
              <AppButton
                buttonState={nav.state}
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                {t('session.signin.loginLink')}
              </AppButton>
            </div>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
