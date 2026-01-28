import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useEffect, useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import ListSubheader from '@mui/material/ListSubheader';
import { useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';
import { useAuth } from 'src/auth/use-auth';
import { useRouter } from 'src/routes/hooks';

import { WorkspacesPopover } from '../components/workspaces-popover';

import type { NavItem } from '../nav-config-dashboard';
import type { WorkspacesPopoverProps } from '../components/workspaces-popover';

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: NavItem[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  workspaces: WorkspacesPopoverProps['data'];
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  workspaces,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        bgcolor: 'var(--layout-nav-bg)',
        borderRight: '1px solid var(--layout-nav-border-color)',
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
  workspaces,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          width: 'var(--layout-nav-mobile-width)',
          bgcolor: 'var(--layout-nav-bg)',
          borderRight: '1px solid var(--layout-nav-border-color)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, workspaces, sx }: NavContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const { user, logout } = useAuth();

  const sections = data.reduce<
    Array<{
      subheader?: Extract<NavItem, { type: 'subheader' }>;
      items: Exclude<NavItem, { type: 'subheader' }>[];
    }>
  >((acc, item) => {
    if (item.type === 'subheader') {
      acc.push({ subheader: item, items: [] });
      return acc;
    }

    if (!acc.length) {
      acc.push({ items: [] });
    }

    acc[acc.length - 1].items.push(item);
    return acc;
  }, []);

  const renderInfo = (info: React.ReactNode) => (
    <Box
      component="span"
      sx={(theme) => ({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 24,
        height: 20,
        px: 0.75,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1,
        color: theme.vars.palette.warning.main,
        bgcolor: varAlpha(theme.vars.palette.warning.mainChannel, 0.18),
      })}
    >
      {info}
    </Box>
  );

  const renderNavItem = (item: Exclude<NavItem, { type: 'subheader' }>) => {
    if (item.type === 'action') {
      const label = item.action === 'logout' && !user ? 'Sign in' : item.title;

      const handleAction = () => {
        if (item.action === 'sign-in') {
          router.push('/sign-in');
          return;
        }

        if (user) {
          logout();
          return;
        }

        router.push('/sign-in');
      };

      return (
        <ListItem disableGutters disablePadding key={item.title}>
          <ListItemButton
            disableGutters
            onClick={handleAction}
            sx={[
              (theme) => ({
                pl: 2,
                py: 0.75,
                gap: 1.5,
                pr: 1.5,
                borderRadius: 1,
                typography: 'body2',
                fontSize: 13,
                fontWeight: 'fontWeightMedium',
                color: theme.vars.palette.text.secondary,
                minHeight: 40,
                transition: theme.transitions.create(['background-color', 'color'], {
                  duration: theme.transitions.duration.shortest,
                }),
                '& .nav-item-icon': {
                  color: theme.vars.palette.text.disabled,
                },
                '&:hover': {
                  color: theme.vars.palette.text.primary,
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                  '& .nav-item-icon': {
                    color: theme.vars.palette.text.primary,
                  },
                },
              }),
            ]}
          >
            <Box
              component="span"
              className="nav-item-icon"
              sx={{
                width: 22,
                height: 22,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </Box>

            <Box component="span" sx={{ flexGrow: 1 }}>
              {label}
            </Box>

            {item.info && renderInfo(item.info)}
          </ListItemButton>
        </ListItem>
      );
    }
    if (item.type === 'toggle') {
      const isOpen = openGroups[item.title] ?? item.defaultOpen ?? true;
      const isGroupActive = item.children.some((child) => child.path === pathname);

      return (
        <Box key={`toggle-${item.title}`} component="li" sx={{ listStyle: 'none' }}>
          <ListItem disableGutters disablePadding>
            <ListItemButton
              disableGutters
              onClick={() =>
                setOpenGroups((prev) => ({
                  ...prev,
                  [item.title]: !isOpen,
                }))
              }
              sx={[
                (theme) => ({
                  pl: 1.5,
                  py: 0.5,
                  pr: 1,
                  borderRadius: 1,
                  typography: 'body2',
                  fontSize: 13,
                  fontWeight: isGroupActive ? 'fontWeightSemiBold' : 'fontWeightMedium',
                  color: isGroupActive
                    ? theme.vars.palette.success.main
                    : theme.vars.palette.text.secondary,
                  bgcolor: isGroupActive
                    ? varAlpha(theme.vars.palette.success.mainChannel, 0.16)
                    : 'transparent',
                  height: 44,
                  transition: theme.transitions.create(['background-color', 'color'], {
                    duration: theme.transitions.duration.shortest,
                  }),
                  '& .nav-item-icon': {
                    color: isGroupActive
                      ? theme.vars.palette.success.main
                      : theme.vars.palette.text.disabled,
                  },
                  '&:hover': {
                    color: isGroupActive
                      ? theme.vars.palette.success.main
                      : theme.vars.palette.text.primary,
                    bgcolor: isGroupActive
                      ? varAlpha(theme.vars.palette.success.mainChannel, 0.24)
                      : varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                    '& .nav-item-icon': {
                      color: isGroupActive
                        ? theme.vars.palette.success.main
                        : theme.vars.palette.text.primary,
                    },
                  },
                }),
              ]}
            >
              <Box
                component="span"
                className="nav-item-icon"
                sx={{
                  width: 24,
                  height: 24,
                  mr: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </Box>

              <Box component="span" sx={{ flexGrow: 1, fontSize: 14 }}>
                {item.title}
              </Box>

              <Iconify
                icon={isOpen ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                width={16}
                sx={{ color: 'inherit' }}
              />
            </ListItemButton>
          </ListItem>

          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box
              component="ul"
              sx={(theme) => ({
                pl: 1.5,
                py: 0.5,
                ml: 3,
                gap: 0.5,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '&::before': {  
                  content: '""',
                  position: 'absolute',
                  left: -2,
                  top: 0,
                  // width: 4,
                  bottom: 22,
                  border: `2px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
                  borderBottom: `none`,
                  borderTop: `none`,
                  borderRight: `none`,
                },
              })}
            >
              {item.children.map((child) => {
                const isChildActived = child.path === pathname;

                return (
                  <ListItem disableGutters disablePadding key={child.title}>
                    <ListItemButton
                      disableGutters
                      component={RouterLink}
                      href={child.path}
                      sx={[
                        (theme) => ({
                          position: 'relative',
                          pl: 1.5,
                          py: 0.6,
                          gap: 1.5,
                          pr: 1.5,
                          borderRadius: 1,
                          typography: 'body2',
                          fontSize: 12.5,
                          fontWeight: isChildActived
                            ? 'fontWeightSemiBold'
                            : 'fontWeightMedium',
                          color: isChildActived
                            ? theme.vars.palette.success.main
                            : theme.vars.palette.text.secondary,
                          bgcolor: isChildActived
                            ? varAlpha(theme.vars.palette.success.mainChannel, 0.16)
                            : 'transparent',
                          minHeight: 36,
                          transition: theme.transitions.create(['background-color', 'color'], {
                            duration: theme.transitions.duration.shortest,
                          }),
                          '& .nav-item-icon': {
                            color: isChildActived
                              ? theme.vars.palette.success.main
                              : theme.vars.palette.text.disabled,
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: -12,
                            top: '50%',
                            width: 12,
                            height: 14,
                            transform: 'translateY(-100%)',
                            transformOrigin: 'center',
                            borderRadius: 0,
                            border: `2px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
                            borderTop: `none`,
                            borderRight: `none`,
                            borderLeft: `none`,
                            // borderBottom: `none`,
                            // borderLeft: `none`,
                            // borderRight: `none`,
                            backgroundColor: 'transparent',
                          },
                          '&:hover': {
                            color: isChildActived
                              ? theme.vars.palette.success.main
                              : theme.vars.palette.text.primary,
                            bgcolor: isChildActived
                              ? varAlpha(theme.vars.palette.success.mainChannel, 0.24)
                              : varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                            '& .nav-item-icon': {
                              color: isChildActived
                                ? theme.vars.palette.success.main
                                : theme.vars.palette.text.primary,
                            },
                          },
                        }),
                      ]}
                    >
                      <Box
                        component="span"
                        className="nav-item-icon"
                        sx={{
                          width: 20,
                          height: 20,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {child.icon}
                      </Box>

                      <Box component="span" sx={{ flexGrow: 1 }}>
                        {child.title}
                      </Box>

                      {child.info && renderInfo(child.info)}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </Box>
          </Collapse>
        </Box>
      );
    }

    const isActived = item.path === pathname;

    return (
      <ListItem disableGutters disablePadding key={item.title}>
        <ListItemButton
          disableGutters
          component={RouterLink}
          href={item.path}
          sx={[
            (theme) => ({
              pl: 1.5,
              py: 0.5,
              pr: 1,
              gap: 1.5,
              borderRadius: 1,
              typography: 'body2',
              fontSize: 13,
              fontWeight: isActived ? 'fontWeightSemiBold' : 'fontWeightMedium',
              color: isActived ? theme.vars.palette.success.main : theme.vars.palette.text.secondary,
              bgcolor: isActived
                ? varAlpha(theme.vars.palette.success.mainChannel, 0.16)
                : 'transparent',
              minHeight: 44,
              transition: theme.transitions.create(['background-color', 'color'], {
                duration: theme.transitions.duration.shortest,
              }),
              '& .nav-item-icon': {
                color: isActived
                  ? theme.vars.palette.success.main
                  : theme.vars.palette.text.disabled,
              },
              '&:hover': {
                color: isActived ? theme.vars.palette.success.main : theme.vars.palette.text.primary,
                bgcolor: isActived
                  ? varAlpha(theme.vars.palette.success.mainChannel, 0.24)
                  : varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                '& .nav-item-icon': {
                  color: isActived
                    ? theme.vars.palette.success.main
                    : theme.vars.palette.text.primary,
                },
              },
            }),
          ]}
        >
          <Box
            component="span"
            className="nav-item-icon"
            sx={{
              width: 24,
              height: 24,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item.icon}
          </Box>

          <Box component="span" sx={{ flexGrow: 1 }}>
            {item.title}
          </Box>

          {item.info && renderInfo(item.info)}
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <>
      <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
        <Logo />
      </Box>

      {slots?.topArea}

      {/* <WorkspacesPopover data={workspaces} sx={{ my: 2 }} /> */}

      <Scrollbar fillContent>
        <Box
          component="nav"
          sx={[
            {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            component="ul"
            sx={{
              gap: 0.5,
              px: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {sections.map((section, index) => {
              const sectionKey = section.subheader?.title ?? `section-${index}`;
              const isSectionOpen = openSections[sectionKey] ?? true;

              return (
                <Box key={sectionKey} component="li" sx={{ listStyle: 'none' }}>
                  {section.subheader && (
                    <ListSubheader
                      disableSticky
                      component="div"
                      onClick={() =>
                        setOpenSections((prev) => ({
                          ...prev,
                          [sectionKey]: !isSectionOpen,
                        }))
                      }
                      sx={(theme) => ({
                        ml: -0.5,
                        pl: 0,
                        pr: 1,
                        pt: 2,
                        pb: 1,
                        typography: 'overline',
                        fontSize: 11,
                        fontWeight: 700,
                        color: theme.vars.palette.text.disabled,
                        letterSpacing: 0.7,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: '.3s ease-in-out all',
                        '& .nav-subheader-arrow': {
                          opacity: 0,
                          transition: '.3s ease-in-out all',
                          transform: isSectionOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                          color: theme.vars.palette.text.disabled,
                        },
                        '&:hover': {
                          color: theme.vars.palette.text.primary,
                        },
                        '&:hover .nav-subheader-arrow': {
                          opacity: 1,
                          mr: 0.75,
                          color: theme.vars.palette.text.primary,
                        },
                      })}
                    >
                      <Iconify
                        icon="eva:arrow-ios-downward-fill"
                        width={16}
                        className="nav-subheader-arrow"
                      />
                      {section.subheader.title}
                    </ListSubheader>
                  )}

                  <Collapse in={isSectionOpen} timeout="auto" unmountOnExit>
                    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, gap: 0.5 }}>
                      {section.items.map((item) => renderNavItem(item))}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
    </>
  );
}
