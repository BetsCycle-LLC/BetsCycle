import { useEffect, useMemo, useRef, useState } from 'react';

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
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';

import { useAuth } from 'src/auth/use-auth';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchPlayerXP, type PlayerXPResponse } from 'src/services/player-xp-api';
import { fetchLoyaltyTiers, type LoyaltyTier } from 'src/services/loyalty-tiers-api';
import { fetchCurrencies, type Currency } from 'src/services/currency-api';

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

const bonusHighlights = [
  {
    title: 'Level-up bonus',
    detail: 'Instant rewards when you unlock a new level.',
  },
  {
    title: 'Faucet interval',
    detail: 'Higher tiers reduce the time between faucet claims.',
  },
  {
    title: 'Weekly rakeback',
    detail: 'Earn a percentage of your weekly net wagering back.',
  },
  {
    title: 'Monthly rakeback',
    detail: 'Monthly cashback grows as you climb in tiers.',
  },
];

export function BetsCycleLoyaltyClubView() {
  const { user, token, openAuthDialog } = useAuth();
  const [xpData, setXpData] = useState<PlayerXPResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(false);
  const [tiersError, setTiersError] = useState<string | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const tiersScrollRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    setTiersLoading(true);
    setTiersError(null);

    Promise.all([fetchLoyaltyTiers(), fetchCurrencies()])
      .then(([tiersResponse, currenciesResponse]) => {
        setTiers(tiersResponse.tiers);
        setCurrencies(currenciesResponse.currencies);
      })
      .catch((err) => {
        setTiersError(err instanceof Error ? err.message : 'Failed to load loyalty tiers');
      })
      .finally(() => setTiersLoading(false));
  }, []);

  const currentLevel = xpData?.loyalty?.currentLevel;
  const nextLevel = xpData?.loyalty?.nextLevel;
  const progressPercentage = xpData?.loyalty?.progressPercentage ?? 0;
  const xpToNextLevel = xpData?.loyalty?.xpToNextLevel ?? 0;

  const sortedTiers = useMemo(() => [...tiers].sort((a, b) => a.order - b.order), [tiers]);
  const maxTierLevels = useMemo(
    () => Math.max(1, ...sortedTiers.map((tier) => tier.levels.length)),
    [sortedTiers]
  );
  const currencyMap = useMemo(
    () => new Map(currencies.map((currency) => [currency.id, currency])),
    [currencies]
  );

  const handleScrollTiers = (direction: 'left' | 'right') => {
    const container = tiersScrollRef.current;
    if (!container) {
      return;
    }

    const scrollAmount = Math.max(240, container.clientWidth);
    const offset = direction === 'left' ? -scrollAmount : scrollAmount;
    const start = container.scrollLeft;
    const target = start + offset;
    const duration = 400;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
      container.scrollLeft = start + (target - start) * ease;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

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
                              .map((bonus) => {
                                const currency = currencyMap.get(bonus.currencyId);
                                return `${bonus.amount} ${currency?.currencyCode ?? bonus.currencyId}`;
                              })
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
                    <Stack spacing={2.5}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip label={`${progressPercentage}%`} color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          {nextLevel
                            ? `${xpToNextLevel.toLocaleString()} XP to reach ${nextLevel.tiersName} Lv.${nextLevel.levelNumber}`
                            : 'Max level reached'}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Stack spacing={0.5} alignItems="center" sx={{ minWidth: 84 }}>
                          {currentLevel?.icon ? (
                            <Avatar
                              src={getImageUrl(currentLevel.icon)}
                              alt={currentLevel.tiersName}
                              sx={{ width: 44, height: 44, bgcolor: 'transparent' }}
                            />
                          ) : (
                            <Avatar sx={{ width: 44, height: 44 }}>
                              <Iconify icon="solar:check-circle-bold" width={22} />
                            </Avatar>
                          )}
                          <Typography variant="caption" color="text.secondary" align="center">
                            {currentLevel ? currentLevel.tiersName : 'Current'}
                          </Typography>
                        </Stack>

                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            value={nextLevel ? progressPercentage : 100}
                            variant="determinate"
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {currentLevel?.xp?.toLocaleString() ?? 0} XP
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {nextLevel?.xp?.toLocaleString() ?? currentLevel?.xp?.toLocaleString() ?? 0} XP
                            </Typography>
                          </Stack>
                        </Box>

                        <Stack spacing={0.5} alignItems="center" sx={{ minWidth: 84 }}>
                          {nextLevel?.icon ? (
                            <Avatar
                              src={getImageUrl(nextLevel.icon)}
                              alt={nextLevel.tiersName}
                              sx={{ width: 44, height: 44, bgcolor: 'transparent' }}
                            />
                          ) : (
                            <Avatar sx={{ width: 44, height: 44, bgcolor: 'grey.200' }}>
                              <Iconify icon="solar:check-circle-bold" width={22} />
                            </Avatar>
                          )}
                          <Typography variant="caption" color="text.secondary" align="center">
                            {nextLevel ? nextLevel.tiersName : 'Max'}
                          </Typography>
                        </Stack>
                      </Stack>

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

        {/* <Card>
          <CardContent> */}
            <Stack spacing={2.5}>
              <Stack
                spacing={1}
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ sm: 'center' }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h5">Loyalty Tiers</Typography>
                  <Typography color="text.secondary">
                    See every tier in the loyalty club and the progression path.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleScrollTiers('left')}
                    sx={{ minWidth: 36, px: 1 }}
                  >
                    <Iconify icon="eva:arrow-ios-upward-fill" sx={{ transform: 'rotate(-90deg)' }} />
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleScrollTiers('right')}
                    sx={{ minWidth: 36, px: 1 }}
                  >
                    <Iconify icon="eva:arrow-ios-upward-fill" sx={{ transform: 'rotate(90deg)' }} />
                  </Button>
                </Stack>
              </Stack>

              {tiersLoading && <LinearProgress />}
              {tiersError && (
                <Typography color="error" variant="body2">
                  {tiersError}
                </Typography>
              )}

              {!tiersLoading && !tiersError && sortedTiers.length > 0 && (
                <Box
                  ref={tiersScrollRef}
                  sx={{
                    overflowX: 'auto',
                    scrollBehavior: 'smooth',
                    pb: 1,
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', pb: 5 }}>
                    <Stack direction="row" alignItems="flex-start">
                      {sortedTiers.map((tier) => {
                        const minXP =
                          tier.levels.length > 0
                            ? Math.min(...tier.levels.map((level) => level.xp))
                            : 0;
                        const levelRatio = tier.levels.length / maxTierLevels;
                        const isCurrentTier = currentLevel?.tiersName === tier.tiersName;

                        return (
                          <Stack key={tier.id} alignItems="center" sx={{ minWidth: '20%' }}>
                            <Box
                              sx={{
                                width: 180,
                                height: 180,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {tier.icon ? (
                                <Box
                                  component="img"
                                  src={getImageUrl(tier.icon)}
                                  alt={tier.tiersName}
                                  sx={{ width: 140, height: 140, objectFit: 'contain' }}
                                />
                              ) : (
                                <Iconify icon="solar:shield-keyhole-bold-duotone" width={180} />
                              )}
                            </Box>

                            <Box
                              sx={{
                                borderBottom: '3px dashed',
                                width: '100%',
                                borderColor: 'rgba(0, 167, 111, 0.4)',
                              }}
                            />

                            <Stack spacing={0.5} alignItems="center" sx={{ pt: 3 }}>
                              <Typography variant="h6" align="center" color="primary" style={{ fontWeight: 900 }}>
                                {tier.tiersName}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center" style={{ marginTop: 0 }}>
                                <Typography variant="subtitle1" color="primary" align="center" style={{ fontWeight: 900 }}>
                                  {minXP.toLocaleString()}
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary" align="center">
                                  XP needed
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                        );
                      })}
                    </Stack>
                  </Box>
                </Box>
              )}

              {!tiersLoading && !tiersError && sortedTiers.length === 0 && (
                <Typography color="text.secondary">No loyalty tiers configured yet.</Typography>
              )}
            </Stack>
          {/* </CardContent>
        </Card> */}

        <Stack spacing={2.5}>
          <Stack spacing={1}>
            <Typography variant="h5">Tier levels & benefits</Typography>
            <Typography color="text.secondary">
              Explore the XP requirements and rewards for every level.
            </Typography>
          </Stack>

          {tiersLoading && <LinearProgress />}
          {tiersError && (
            <Typography color="error" variant="body2">
              {tiersError}
            </Typography>
          )}

          {!tiersLoading && !tiersError && sortedTiers.length > 0 && (
            <Stack spacing={3}>
              {sortedTiers.map((tier) => {
                const sortedLevels = [...tier.levels].sort(
                  (a, b) => a.levelNumber - b.levelNumber
                );

                return (
                  <Card key={tier.id}>
                    <CardContent>
                      <Stack spacing={2.5}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            src={tier.icon ? getImageUrl(tier.icon) : undefined}
                            alt={tier.tiersName}
                            sx={{ width: 48, height: 48, bgcolor: 'background.neutral' }}
                          >
                            <Iconify icon="solar:shield-keyhole-bold-duotone" width={24} />
                          </Avatar>
                          <Box>
                            <Typography variant="h6">{tier.tiersName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {sortedLevels.length} levels in this tier
                            </Typography>
                          </Box>
                        </Stack>

                        {sortedLevels.length === 0 ? (
                          <Typography color="text.secondary">
                            No levels configured for this tier yet.
                          </Typography>
                        ) : (
                          <Stack spacing={2}>
                            {sortedLevels.map((level) => {
                              const faucetLabel =
                                level.faucetInterval > 0
                                  ? `${level.faucetInterval} min`
                                  : 'Not set';
                              const bonuses = level.levelUpBonus.length
                                ? level.levelUpBonus.map((bonus) => {
                                  const currency = currencyMap.get(bonus.currencyId);
                                  return `${bonus.amount} ${currency?.currencyCode ?? bonus.currencyId}`;
                                })
                                : ['No bonuses'];

                              return (
                                <Box
                                  key={`${tier.id}-${level.levelNumber}`}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                  }}
                                >
                                  <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Chip label={`Level ${level.levelNumber}`} size="small" color="primary" />
                                      <Typography variant="body2" color="text.secondary">
                                        {level.xp.toLocaleString()} XP required
                                      </Typography>
                                    </Stack>

                                    <Divider />

                                    <Grid container spacing={2}>
                                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Typography variant="caption" color="text.secondary">
                                          Weekly rakeback
                                        </Typography>
                                        <Typography variant="subtitle2">
                                          {level.weeklyRakeback}%
                                        </Typography>
                                      </Grid>
                                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Typography variant="caption" color="text.secondary">
                                          Monthly rakeback
                                        </Typography>
                                        <Typography variant="subtitle2">
                                          {level.monthlyRakeback}%
                                        </Typography>
                                      </Grid>
                                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Typography variant="caption" color="text.secondary">
                                          Faucet interval
                                        </Typography>
                                        <Typography variant="subtitle2">{faucetLabel}</Typography>
                                      </Grid>
                                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Typography variant="caption" color="text.secondary">
                                          Level-up bonus
                                        </Typography>
                                        {bonuses.map((bonus) => (
                                          <Typography
                                            variant="subtitle2"
                                            key={`${tier.id}-${level.levelNumber}-${bonus}`}
                                          >
                                            {bonus}
                                          </Typography>
                                        ))}
                                      </Grid>
                                    </Grid>
                                  </Stack>
                                </Box>
                              );
                            })}
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}

          {!tiersLoading && !tiersError && sortedTiers.length === 0 && (
            <Typography color="text.secondary">No loyalty tiers configured yet.</Typography>
          )}
        </Stack>

        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="h5">Loyalty club bonuses</Typography>
            <Typography color="text.secondary">
              Learn how bonuses are earned as you move up the loyalty ladder.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {bonusHighlights.map((bonus) => (
              <Grid key={bonus.title} size={{ xs: 12, md: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6">{bonus.title}</Typography>
                      <Typography color="text.secondary">{bonus.detail}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Stack>
    </DashboardContent>
  );
}

