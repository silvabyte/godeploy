import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { initializeI18n } from './i18n/i18nConfig';
import { createAuthService } from './services/serviceInitialization';
import { ServiceProvider } from './services/ServiceContext';
import { createRouter } from './router/routes';
import { ThemeProvider } from '@matsilva/xcomponents';
/**
 * Main application entry point
 * Initializes services, i18n, and renders the React application
 */
const loadApp = async () => {
  // Initialize services
  const authService = createAuthService();

  // Create router with the auth service
  const router = createRouter(authService);

  // Initialize internationalization
  await initializeI18n();

  // Render the application with service provider
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider
      theme={{
        button: {
          brandColor: '#00FFFF', // cyan-600
          brandTextColor: 'white',
          brandHoverBrightness: 1.3,
          brandOutlineBorderColor: '#00FFFF', // cyan-600
          brandOutlineTextColor: '#00FFFF', // cyan-600
        },
      }}
    >
      <ServiceProvider authService={authService}>
        <RouterProvider router={router} />
      </ServiceProvider>
    </ThemeProvider>,
  );
};

// Start the application
loadApp();
