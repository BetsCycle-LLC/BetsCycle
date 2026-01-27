import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';

import App from './app';
import { AuthProvider } from './auth/auth-context';
import { SnackbarProvider } from './components/snackbar/snackbar-provider';
import { routesSection } from './routes/sections';
import { ErrorBoundary } from './routes/components';
import { ThemeProvider } from './theme/theme-provider';

// ----------------------------------------------------------------------

const router = createBrowserRouter([
  {
    Component: () => (
      <App>
        <Outlet />
      </App>
    ),
    errorElement: <ErrorBoundary />,
    children: routesSection,
  },
]);

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SnackbarProvider>
          <RouterProvider router={router} />
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
