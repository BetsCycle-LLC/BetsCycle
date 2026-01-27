import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navigate, useLocation } from 'react-router';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { DashboardLayout } from 'src/layouts/dashboard';
import { useAuth } from 'src/auth/use-auth';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const OriginalsPage = lazy(() => import('src/pages/originals'));
export const CasinoPage = lazy(() => import('src/pages/casino'));
export const SportsPage = lazy(() => import('src/pages/sports'));
export const PromotionsPage = lazy(() => import('src/pages/promotions'));
export const VipPage = lazy(() => import('src/pages/vip'));
export const WalletPage = lazy(() => import('src/pages/wallet'));
export const SupportPage = lazy(() => import('src/pages/support'));
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'originals', element: <OriginalsPage /> },
      { path: 'casino', element: <CasinoPage /> },
      { path: 'sports', element: <SportsPage /> },
      { path: 'promotions', element: <PromotionsPage /> },
      { path: 'vip', element: <VipPage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'support', element: <SupportPage /> },
      { path: 'user', element: <UserPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <Suspense fallback={renderFallback()}>
        <SignInPage />
      </Suspense>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];

// ----------------------------------------------------------------------

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useAuth();
  const { pathname } = useLocation();

  if (!isReady) {
    return renderFallback();
  }

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: pathname }} />;
  }

  return <>{children}</>;
}
