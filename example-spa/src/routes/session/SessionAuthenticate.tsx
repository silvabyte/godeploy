import { Link, LoaderFunctionArgs, redirect, useLoaderData } from 'react-router-dom';
import { EmailOtpType } from '@supabase/supabase-js';
import { t } from '@matsilva/xtranslate';
import { SupportLink } from '../../support/SupportLink';
import { Logo } from '../../logo/Logo';
import { Alert } from '@matsilva/xcomponents';
import {
  DEEP_LINK_PROTOCOL,
  REDIRECT_URL_PARAM,
  REDIRECT_URL_STORAGE_KEY,
} from '../../constants/deepLinkConstants';
import { AuthService } from '../../auth/auth';

export interface SessionAuthenticateLoaderResponse {
  error: string | null;
}

/**
 * Creates a session authenticate loader function with the provided AuthService
 */
export function createSessionAuthenticateLoader(authService: AuthService) {
  return async function sessionAuthenticateLoader({
    request,
  }: LoaderFunctionArgs): Promise<SessionAuthenticateLoaderResponse | Response> {
    const url = new URL(request.url);
    const token_hash = url.searchParams.get('token_hash') as string;
    const type = url.searchParams.get('type') as EmailOtpType;
    const redirectUrl = url.searchParams.get(REDIRECT_URL_PARAM);

    // Store the redirect URL in localStorage if it's a valid audetic:// URL
    if (
      redirectUrl &&
      redirectUrl.startsWith(DEEP_LINK_PROTOCOL) &&
      typeof window !== 'undefined'
    ) {
      localStorage.setItem(REDIRECT_URL_STORAGE_KEY, redirectUrl);
    }

    if (!token_hash || !type) {
      return { error: 'Missing token or type' };
    }

    const { error } = await authService.verifyOTP(token_hash, type);

    if (error) {
      // Pass the error message for the component to display
      return { error: error.message };
    }
    // Redirect to verify on success
    return redirect('/verify/');
  };
}

export default function SessionAuthenticate() {
  const { error } = useLoaderData() as SessionAuthenticateLoaderResponse;

  return error ? (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-white">
          {t('session.authenticate.oops')}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <Alert type="danger" title={error} />
          <p>
            {t('session.authenticate.please')}{' '}
            <Link to="/">
              <span className="italic underline">{t('session.authenticate.signingIn')}</span>{' '}
            </Link>
            {t('session.authenticate.again')} <SupportLink />
          </p>
        </div>
      </div>
    </div>
  ) : null;
}
