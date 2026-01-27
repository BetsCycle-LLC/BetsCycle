import type { Breakpoint } from '@mui/material/styles';

import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { useTheme } from '@mui/material/styles';

import { _langs, _notifications } from 'src/_mock';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { NavMobile, NavDesktop } from './nav';
import { layoutClasses } from '../core/classes';
import { _account } from '../nav-config-account';
import { dashboardLayoutVars } from './css-vars';
import { navData } from '../nav-config-dashboard';
import { MainSection } from '../core/main-section';
import { Searchbar } from '../components/searchbar';
import { MenuButton } from '../components/menu-button';
import { _workspaces } from '../nav-config-workspace';
import { ThemeModeToggle } from '../components/theme-mode-toggle';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { AccountPopover } from '../components/account-popover';
import { LanguagePopover } from '../components/language-popover';
import { NotificationsPopover } from '../components/notifications-popover';
import { useAuth } from 'src/auth/use-auth';

import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
  };
};

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
}: DashboardLayoutProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const { user, openAuthDialog } = useAuth();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
      },
    };

    const breadcrumbItems = pathname
      .split('?')[0]
      .split('#')[0]
      .split('/')
      .filter(Boolean);

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile data={navData} open={open} onClose={onClose} workspaces={_workspaces} />
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              ml: 1,
              color: 'text.secondary',
              '& a': { color: 'text.secondary' },
              '& .MuiBreadcrumbs-ol': { alignItems: 'center' },
            }}
          >
            <Link component={RouterLink} href="/">
              Home
            </Link>
            {breadcrumbItems.map((segment, index) => {
              const href = `/${breadcrumbItems.slice(0, index + 1).join('/')}`;
              const label = segment
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase());

              const isLast = index === breadcrumbItems.length - 1;

              if (isLast) {
                return (
                  <Typography key={href} color="text.primary" variant="body2">
                    {label}
                  </Typography>
                );
              }

              return (
                <Link key={href} component={RouterLink} href={href}>
                  {label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          {/** @slot Searchbar */}
          <Searchbar />

          {/** @slot Theme mode toggle */}
          <ThemeModeToggle />

          {/** @slot Language popover */}
          <LanguagePopover data={_langs} />

          {/** @slot Notifications popover */}
          {
            user && (
              <NotificationsPopover data={_notifications} />
            )
          }

          {user ? (
            /** @slot Account drawer */
            <AccountPopover data={_account} />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                color="inherit"
                variant="outlined"
                onClick={() => openAuthDialog('sign-in')}
              >
                Sign in
              </Button>
              <Button
                size="small"
                color="inherit"
                variant="contained"
                onClick={() => openAuthDialog('sign-up')}
              >
                Sign up
              </Button>
            </Box>
          )}
        </Box>
      ),
    };

    return (
      <HeaderSection
        disableElevation
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Sidebar
       *************************************** */
      sidebarSection={
        <NavDesktop data={navData} layoutQuery={layoutQuery} workspaces={_workspaces} />
      }
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...dashboardLayoutVars(theme), ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}
