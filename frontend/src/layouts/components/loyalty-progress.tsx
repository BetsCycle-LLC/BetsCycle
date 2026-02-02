import type { BoxProps } from '@mui/material/Box';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import { useAuth } from 'src/auth/auth-context';
import { fetchPlayerXP, type PlayerXPResponse } from 'src/services/player-xp-api';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const getImageUrl = (iconPath: string) => {
  if (!iconPath) return '';
  if (iconPath.startsWith('http')) return iconPath;
  if (iconPath.startsWith('/uploads')) {
    return `${API_BASE_URL}${iconPath}`;
  }
  return iconPath;
};

export function LoyaltyProgress({ sx, ...other }: BoxProps) {
  const { user, token } = useAuth();
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const [xpData, setXpData] = useState<PlayerXPResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  // Fetch player XP on mount
  useEffect(() => {
    if (!user || !token) return;

    setLoading(true);
    setError(null);

    fetchPlayerXP(user.id, token)
      .then((response) => {
        setXpData(response);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load XP data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, token]);

  if (!user || !token) return null;

  const currentLevel = xpData?.loyalty?.currentLevel;
  const nextLevel = xpData?.loyalty?.nextLevel;
  const progressPercentage = xpData?.loyalty?.progressPercentage ?? 0;
  const xpToNextLevel = xpData?.loyalty?.xpToNextLevel ?? 0;

  return (
    <>
      <Box
        onClick={handleOpenPopover}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1,
          py: 0.75,
          borderRadius: 1,
          cursor: 'pointer',
          border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          background: currentLevel
            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)'
            : 'transparent',
          transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
          '&:hover': {
            backgroundColor: (theme) => theme.vars.palette.action.hover,
            borderColor: (theme) => theme.vars.palette.primary.main,
          },
          ...sx,
        }}
        {...other}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            {currentLevel && currentLevel.icon ? (
              <Avatar
                sx={{
                  bgcolor: 'transparent',
                  width: 32,
                  height: 32,
                }}
              >
                <Box
                  component="img"
                  src={getImageUrl(currentLevel.icon)}
                  alt={currentLevel.tiersName}
                  sx={{
                    width: 24,
                    height: 24,
                    objectFit: 'contain',
                  }}
                />
              </Avatar>
            ) : (
              <Avatar
                sx={{
                  bgcolor: (theme) => theme.vars.palette.grey[500],
                  width: 32,
                  height: 32,
                }}
              >
                <Iconify icon="solar:check-circle-bold" width={20} />
              </Avatar>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 80 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
                {currentLevel ? `${currentLevel.tiersName} Lv.${currentLevel.levelNumber}` : 'No Level'}
              </Typography>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
                {xpData?.xp?.toLocaleString() ?? 0} XP
              </Typography>
            </Box>

            <Iconify
              icon="eva:arrow-ios-downward-fill"
              width={16}
              sx={{
                ml: 0.5,
                color: 'text.secondary',
                transition: (theme) => theme.transitions.create(['transform']),
                transform: openPopover ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </>
        )}
      </Box>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 380 },
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Loyalty Progress
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Keep playing to level up and unlock rewards
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          )}

          {error && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Box>
          )}

          {!loading && !error && xpData && (
            <Stack spacing={2.5}>
              {/* Current Level Info */}
              {currentLevel && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.08) 100%)',
                    border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      component="img"
                      src={getImageUrl(currentLevel.icon)}
                      alt={currentLevel.tiersName}
                      sx={{
                        width: 56,
                        height: 56,
                        objectFit: 'contain',
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {currentLevel.tiersName}
                      </Typography>
                      <Chip
                        label={`Level ${currentLevel.levelNumber}`}
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Weekly Rakeback
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {currentLevel.weeklyRakeback}%
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Monthly Rakeback
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {currentLevel.monthlyRakeback}%
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              )}

              {/* XP Progress */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">
                    Your XP: {xpData.xp.toLocaleString()}
                  </Typography>
                  {nextLevel && (
                    <Chip
                      label={`${xpToNextLevel.toLocaleString()} XP to next level`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Stack>

                {nextLevel ? (
                  <>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercentage}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        backgroundColor: (theme) => theme.vars.palette.action.disabledBackground,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 1,
                          background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                        },
                      }}
                    />
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {currentLevel?.xp.toLocaleString() ?? 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {nextLevel.xp.toLocaleString()}
                      </Typography>
                    </Stack>
                  </>
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 2,
                      backgroundColor: (theme) => theme.vars.palette.success.lighter,
                    }}
                  >
                    <Iconify icon="solar:check-circle-bold" width={32} sx={{ color: 'success.main', mb: 1 }} />
                    <Typography variant="subtitle2" color="success.main">
                      Max Level Reached!
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Next Level Preview */}
              {nextLevel && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
                    backgroundColor: (theme) => theme.vars.palette.action.hover,
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                    {nextLevel.icon && (
                      <Box
                        component="img"
                        src={getImageUrl(nextLevel.icon)}
                        alt={nextLevel.tiersName}
                        sx={{
                          width: 40,
                          height: 40,
                          objectFit: 'contain',
                          opacity: 0.7,
                        }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.25 }}>
                        Next Level
                      </Typography>
                      <Typography variant="subtitle2">
                        {nextLevel.tiersName} Level {nextLevel.levelNumber}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.813rem' }}>
                        Weekly Rakeback
                      </Typography>
                      <Typography variant="body2" fontWeight={600} fontSize="0.813rem">
                        {nextLevel.weeklyRakeback}%
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.813rem' }}>
                        Monthly Rakeback
                      </Typography>
                      <Typography variant="body2" fontWeight={600} fontSize="0.813rem">
                        {nextLevel.monthlyRakeback}%
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Popover>
    </>
  );
}

