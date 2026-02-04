import type { Breakpoint } from '@mui/material/styles';

import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { varAlpha } from 'minimal-shared/utils';

import { _langs, _notifications } from 'src/_mock';
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
import { BalancePopover } from '../components/balance-popover';
import { useAuth } from 'src/auth/use-auth';
import { Iconify } from 'src/components/iconify';
import { Logo } from 'src/components/logo';

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
  const { user, openAuthDialog } = useAuth();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const navTopArea = (
    <Box sx={{ px: 2.5, pb: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          component={RouterLink}
          href="/tournaments"
          size="small"
          startIcon={<Iconify icon="solar:pen-bold" width={18} />}
          sx={{
            flex: 1,
            minWidth: 0,
            color: theme.vars.palette.common.white,
            textTransform: 'none',
            fontWeight: 600,
            backgroundImage: `linear-gradient(135deg, ${varAlpha(
              theme.vars.palette.primary.mainChannel,
              0.9
            )} 0%, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.45)} 100%)`,
            boxShadow: `inset 0 0 0 1px ${varAlpha(
              theme.vars.palette.primary.mainChannel,
              0.2
            )}`,
            '&:hover': {
              backgroundImage: `linear-gradient(135deg, ${varAlpha(
                theme.vars.palette.primary.mainChannel,
                0.95
              )} 0%, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.6)} 100%)`,
            },
            '& .MuiButton-startIcon': {
              mr: 0.75,
            },
          }}
        >
          Tournaments
        </Button>
        <Button
          component={RouterLink}
          href="/wheel-spin"
          size="small"
          startIcon={<Iconify icon="solar:restart-bold" width={18} />}
          sx={{
            flex: 1,
            minWidth: 0,
            color: theme.vars.palette.common.white,
            textTransform: 'none',
            fontWeight: 600,
            backgroundImage: `linear-gradient(135deg, ${varAlpha(
              theme.vars.palette.secondary.mainChannel,
              0.9
            )} 0%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.45)} 100%)`,
            boxShadow: `inset 0 0 0 1px ${varAlpha(
              theme.vars.palette.secondary.mainChannel,
              0.2
            )}`,
            '&:hover': {
              backgroundImage: `linear-gradient(135deg, ${varAlpha(
                theme.vars.palette.secondary.mainChannel,
                0.95
              )} 0%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.6)} 100%)`,
            },
            '& .MuiButton-startIcon': {
              mr: 0.75,
            },
          }}
        >
          Wheel Spin
        </Button>
      </Box>
    </Box>
  );

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
      },
    };

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
          <NavMobile
            data={navData}
            open={open}
            onClose={onClose}
            workspaces={_workspaces}
            slots={{ topArea: navTopArea }}
          />
          <Box
            component={RouterLink}
            href="/"
            sx={{
              ml: 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
            }}
          >
            <Logo sx={{ width: 28, height: 28 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: 0.5,
                color: theme.vars.palette.text.primary,
              }}
            >
              BETSCYCLE
            </Typography>
          </Box>
        </>
      ),
      centerArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {user && <BalancePopover />}
        </Box>
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
        <NavDesktop
          data={navData}
          layoutQuery={layoutQuery}
          workspaces={_workspaces}
          slots={{ topArea: navTopArea }}
        />
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
