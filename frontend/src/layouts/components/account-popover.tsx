import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter, usePathname } from 'src/routes/hooks';

import { useAuth } from 'src/auth/use-auth';
import { fetchPlayerXP, type PlayerXPResponse } from 'src/services/player-xp-api';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const getImageUrl = (iconPath: string) => {
  if (!iconPath) return '';
  if (iconPath.startsWith('http')) return iconPath;
  if (iconPath.startsWith('/uploads')) {
    return `${API_BASE_URL}${iconPath}`;
  }
  return iconPath;
};

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const pathname = usePathname();

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [xpData, setXpData] = useState<PlayerXPResponse | null>(null);
  const [loadingXP, setLoadingXP] = useState(false);
  const [xpError, setXpError] = useState<string | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget as HTMLButtonElement);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleLogout = useCallback(() => {
    handleClosePopover();
    logout();
  }, [handleClosePopover, logout]);

  const handleClickItem = useCallback(
    (path: string) => {
      handleClosePopover();
      router.push(path);
    },
    [handleClosePopover, router]
  );

  useEffect(() => {
    if (!user || !token) return;

    setLoadingXP(true);
    setXpError(null);

    fetchPlayerXP(user.id, token)
      .then((response) => {
        setXpData(response);
      })
      .catch((err) => {
        setXpError(err instanceof Error ? err.message : 'Failed to load XP data');
      })
      .finally(() => {
        setLoadingXP(false);
      });
  }, [user, token]);

  const menuItems = useMemo(() => {
    const extras = [
      {
        label: 'Loyalty Club',
        href: '/loyalty-club',
        icon: <Iconify width={22} icon="solar:check-circle-bold" />,
      },
      {
        label: 'Promotions',
        href: '/promotions',
        icon: <Iconify width={22} icon="solar:share-bold" />,
      },
    ];

    const existingHrefs = new Set(data.map((item) => item.href));
    return [...data, ...extras.filter((item) => !existingHrefs.has(item.href))];
  }, [data]);

  const currentLevel = xpData?.loyalty?.currentLevel;
  const nextLevel = xpData?.loyalty?.nextLevel;
  const progressPercentage = xpData?.loyalty?.progressPercentage ?? 0;
  const xpToNextLevel = xpData?.loyalty?.xpToNextLevel ?? 0;
  const displayName = user?.username || user?.email || 'User';
  const avatarUrl = getImageUrl(user?.avatar ?? '');
  const tierIconUrl = getImageUrl(currentLevel?.icon ?? '');

  if (!user) return null;

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        aria-haspopup="menu"
        aria-expanded={!!openPopover}
        sx={{
          p: '2px',
          width: 40,
          height: 40,
          background: (theme) =>
            `conic-gradient(${theme.vars.palette.primary.light}, ${theme.vars.palette.warning.light}, ${theme.vars.palette.primary.light})`,
          ...sx,
        }}
        {...other}
      >
        <Box sx={{ position: 'relative', width: 1, height: 1 }}>
          <Avatar src={avatarUrl} alt={displayName} sx={{ width: 1, height: 1 }}>
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          {tierIconUrl && (
            <Box
              sx={{
                position: 'absolute',
                right: -2,
                bottom: -2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                bgcolor: 'background.paper',
                border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0.25,
              }}
            >
              <Box
                component="img"
                src={tierIconUrl}
                alt={currentLevel?.tiersName ?? 'Tier'}
                sx={{ width: 14, height: 14, objectFit: 'contain' }}
              />
            </Box>
          )}
        </Box>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: { width: 320, mt: 1 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {displayName}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Loyalty Level
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            Track your XP and progress to the next tier.
          </Typography>

          {loadingXP && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!loadingXP && xpError && (
            <Typography variant="body2" color="error">
              {xpError}
            </Typography>
          )}

          {!loadingXP && !xpError && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: 'transparent',
                  width: 36,
                  height: 36,
                  border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                }}
              >
                {tierIconUrl ? (
                  <Box
                    component="img"
                    src={tierIconUrl}
                    alt={currentLevel?.tiersName ?? 'Tier'}
                    sx={{ width: 24, height: 24, objectFit: 'contain' }}
                  />
                ) : (
                  <Iconify icon="solar:check-circle-bold" width={20} />
                )}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                  {currentLevel
                    ? `${currentLevel.tiersName} Lv.${currentLevel.levelNumber}`
                    : 'Unranked'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {xpData?.xp?.toLocaleString() ?? 0} XP • {xpToNextLevel.toLocaleString()} XP to next
                  level
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progressPercentage}
                  sx={{ mt: 0.75, height: 6, borderRadius: 999 }}
                />
              </Box>

              {nextLevel?.icon && (
                <Avatar
                  sx={{
                    bgcolor: 'transparent',
                    width: 32,
                    height: 32,
                    border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                  }}
                >
                  <Box
                    component="img"
                    src={getImageUrl(nextLevel.icon)}
                    alt={nextLevel.tiersName}
                    sx={{ width: 20, height: 20, objectFit: 'contain' }}
                  />
                </Avatar>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList
          disablePadding
          sx={{
            p: 1,
            gap: 0.5,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
              [`&.${menuItemClasses.selected}`]: {
                color: 'text.primary',
                bgcolor: 'action.selected',
                fontWeight: 'fontWeightSemiBold',
              },
            },
          }}
        >
          {menuItems.map((option) => (
            <MenuItem
              key={option.label}
              selected={option.href === pathname}
              onClick={() => handleClickItem(option.href)}
            >
              {option.icon}
              {option.label}
            </MenuItem>
          ))}
        </MenuList>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth color="error" size="medium" variant="text" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Popover>
    </>
  );
}
