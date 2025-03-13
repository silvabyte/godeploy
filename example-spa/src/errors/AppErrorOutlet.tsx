import { useNavigate, useRouteError } from 'react-router-dom';
import { t } from '@matsilva/xtranslate';
import { AppButton, SupportLink } from '@matsilva/xcomponents';
import { useEffect } from 'react';

export function AppErrorOutlet() {
  const error = useRouteError() as Error & { statusText?: string };
  const nav = useNavigate();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-black">{t('common.errors.oops')}</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {error.statusText || error.message}
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">{t('common.errors.generic')}</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <div>
            <AppButton
              className="bg-gray-900 hover:bg-gray-800 transition-colors px-4"
              onClick={() => nav('/')}
            >
              {t('nav.goHome')}
            </AppButton>
          </div>
          <SupportLink classes="capitalize" />
        </div>
      </div>
    </main>
  );
}
