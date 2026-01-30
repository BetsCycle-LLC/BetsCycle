import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { DashboardLayout } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const OriginalsPage = lazy(() => import('src/pages/originals'));
export const CasinoPage = lazy(() => import('src/pages/casino'));
export const SportsPage = lazy(() => import('src/pages/sports'));
export const PromotionsPage = lazy(() => import('src/pages/promotions'));
export const LoyaltyClubPage = lazy(() => import('src/pages/loyalty-club'));
export const VipPage = lazy(() => import('src/pages/vip'));
export const WalletPage = lazy(() => import('src/pages/wallet'));
export const SupportPage = lazy(() => import('src/pages/support'));
export const UserPage = lazy(() => import('src/pages/user'));
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
      <DashboardLayout>
        <Suspense fallback={renderFallback()}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'originals', element: <OriginalsPage /> },
      { path: 'casino', element: <CasinoPage /> },
      { path: 'sports', element: <SportsPage /> },
      { path: 'promotions', element: <PromotionsPage /> },
      { path: 'loyalty-club', element: <LoyaltyClubPage /> },
      { path: 'vip', element: <VipPage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'support', element: <SupportPage /> },
      { path: 'user', element: <UserPage /> },
    ],
  },
  // Auth is handled via modal instead of routes.
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
