import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

import { useAuth } from 'src/auth/use-auth';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchPlayerXP, type PlayerXPResponse } from 'src/services/player-xp-api';

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

const rewards = [
  {
    title: 'Weekly rakeback',
    detail: 'Earn cashback every week based on your net wagering.',
  },
  {
    title: 'Monthly boosts',
    detail: 'Monthly rewards increase as you climb to higher tiers.',
  },
  {
    title: 'Level-up bonuses',
    detail: 'Instant credits when you reach the next loyalty level.',
  },
];

const earningActions = [
  {
    title: 'Play Originals',
    detail: 'Rack up XP quickly through fast rounds and high volume sessions.',
  },
  {
    title: 'Casino wagering',
    detail: 'Slots and live tables contribute to your loyalty progress.',
  },
  {
    title: 'Sportsbook bets',
    detail: 'Every bet increases your XP and unlocks higher tiers.',
  },
];

export function BetsCycleLoyaltyClubView() {
  const { user, token, openAuthDialog } = useAuth();
  const [xpData, setXpData] = useState<PlayerXPResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) {
      setXpData(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetchPlayerXP(user.id, token)
      .then((response) => setXpData(response))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load loyalty data');
      })
      .finally(() => setLoading(false));
  }, [user, token]);

  const currentLevel = xpData?.loyalty?.currentLevel;
  const nextLevel = xpData?.loyalty?.nextLevel;
  const progressPercentage = xpData?.loyalty?.progressPercentage ?? 0;
  const xpToNextLevel = xpData?.loyalty?.xpToNextLevel ?? 0;

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4">Loyalty Club</Typography>
          <Typography color="text.secondary">
            Track your XP, climb through tiers, and unlock rakeback, bonuses, and exclusive perks.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Your status</Typography>

                  {!user && (
                    <Stack spacing={2}>
                      <Typography color="text.secondary">
                        Sign in to see your current tier, progress, and rewards.
                      </Typography>
                      <Button variant="contained" onClick={() => openAuthDialog('sign-in')}>
                        Sign in to view status
                      </Button>
                    </Stack>
                  )}

                  {user && (
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {currentLevel?.icon ? (
                          <Avatar
                            src={getImageUrl(currentLevel.icon)}
                            alt={currentLevel.tiersName}
                            sx={{ width: 48, height: 48, bgcolor: 'transparent' }}
                          />
                        ) : (
                          <Avatar sx={{ width: 48, height: 48 }}>
                            <Iconify icon="solar:check-circle-bold" width={24} />
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="subtitle1">
                            {currentLevel
                              ? `${currentLevel.tiersName} Lv.${currentLevel.levelNumber}`
                              : 'No level yet'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {xpData?.xp?.toLocaleString() ?? 0} XP earned
                          </Typography>
                        </Box>
                      </Stack>

                      {currentLevel && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            label={`Weekly ${currentLevel.weeklyRakeback}%`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`Monthly ${currentLevel.monthlyRakeback}%`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      )}

                      {currentLevel?.levelUpBonus?.length ? (
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle2">Level-up bonuses</Typography>
                          <Typography color="text.secondary" variant="body2">
                            {currentLevel.levelUpBonus
                              .map((bonus) => `${bonus.amount} ${bonus.currencyId}`)
                              .join(', ')}
                          </Typography>
                        </Stack>
                      ) : null}
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Tier progress</Typography>
                  {loading && <LinearProgress />}
                  {error && (
                    <Typography color="error" variant="body2">
                      {error}
                    </Typography>
                  )}
                  {!loading && !error && (
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip label={`${progressPercentage}%`} color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          {xpToNextLevel.toLocaleString()} XP to reach
                          {nextLevel ? ` ${nextLevel.tiersName} Lv.${nextLevel.levelNumber}` : ' next level'}
                        </Typography>
                      </Stack>
                      <LinearProgress value={progressPercentage} variant="determinate" />
                      <Typography variant="body2" color="text.secondary">
                        Play across Originals, Casino, and Sports to build XP and unlock higher rewards.
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {rewards.map((reward) => (
            <Grid key={reward.title} size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="h6">{reward.title}</Typography>
                    <Typography color="text.secondary">{reward.detail}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {earningActions.map((action) => (
            <Grid key={action.title} size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="h6">{action.title}</Typography>
                    <Typography color="text.secondary">{action.detail}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </DashboardContent>
  );
}

