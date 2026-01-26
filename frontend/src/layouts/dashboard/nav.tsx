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

import { NavUpgrade } from '../components/nav-upgrade';
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
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  return (
    <>
      <Logo />

      {slots?.topArea}

      <WorkspacesPopover data={workspaces} sx={{ my: 2 }} />

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
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {data.map((item) => {
              if (item.type === 'subheader') {
                return (
                  <ListSubheader
                    key={`subheader-${item.title}`}
                    disableSticky
                    component="li"
                    sx={(theme) => ({
                      mt: 1.75,
                      px: 2,
                      py: 0.5,
                      listStyle: 'none',
                      typography: 'overline',
                      color: theme.vars.palette.text.disabled,
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        width: 10,
                        height: 1,
                        backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.32),
                        transform: 'translateY(-50%)',
                      },
                    })}
                  >
                    {item.title}
                  </ListSubheader>
                );
              }

              if (item.type === 'toggle') {
                const isOpen = openGroups[item.title] ?? item.defaultOpen ?? true;

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
                            pl: 2,
                            py: 1,
                            gap: 2,
                            pr: 1.5,
                            borderRadius: 0.75,
                            typography: 'body2',
                            fontWeight: 'fontWeightMedium',
                            color: theme.vars.palette.text.secondary,
                            minHeight: 44,
                            '&:hover': {
                              bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                            },
                          }),
                        ]}
                      >
                        <Box component="span" sx={{ width: 24, height: 24 }}>
                          {item.icon}
                        </Box>

                        <Box component="span" sx={{ flexGrow: 1 }}>
                          {item.title}
                        </Box>

                        <Iconify
                          icon={
                            isOpen ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'
                          }
                          width={18}
                        />
                      </ListItemButton>
                    </ListItem>

                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <Box component="ul" sx={{ pl: 2.5, py: 0.5 }}>
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
                                    pl: 2,
                                    py: 0.75,
                                    gap: 2,
                                    pr: 1.5,
                                    borderRadius: 0.75,
                                    typography: 'body2',
                                    fontWeight: 'fontWeightMedium',
                                    color: theme.vars.palette.text.secondary,
                                    minHeight: 40,
                                    ...(isChildActived && {
                                      fontWeight: 'fontWeightSemiBold',
                                      color: theme.vars.palette.primary.main,
                                      bgcolor: varAlpha(
                                        theme.vars.palette.primary.mainChannel,
                                        0.08
                                      ),
                                      '&:hover': {
                                        bgcolor: varAlpha(
                                          theme.vars.palette.primary.mainChannel,
                                          0.16
                                        ),
                                      },
                                    }),
                                  }),
                                ]}
                              >
                                <Box component="span" sx={{ width: 24, height: 24 }}>
                                  {child.icon}
                                </Box>

                                <Box component="span" sx={{ flexGrow: 1 }}>
                                  {child.title}
                                </Box>

                                {child.info && child.info}
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
                        pl: 2,
                        py: 1,
                        gap: 2,
                        pr: 1.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                        fontWeight: 'fontWeightMedium',
                        color: theme.vars.palette.text.secondary,
                        minHeight: 44,
                        ...(isActived && {
                          fontWeight: 'fontWeightSemiBold',
                          color: theme.vars.palette.primary.main,
                          bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                          '&:hover': {
                            bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
                          },
                        }),
                      }),
                    ]}
                  >
                    <Box component="span" sx={{ width: 24, height: 24 }}>
                      {item.icon}
                    </Box>

                    <Box component="span" sx={{ flexGrow: 1 }}>
                      {item.title}
                    </Box>

                    {item.info && item.info}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}

      <NavUpgrade />
    </>
  );
}
