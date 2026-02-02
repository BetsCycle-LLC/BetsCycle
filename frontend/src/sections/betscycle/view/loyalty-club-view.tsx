import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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
import { useCurrencyStore } from 'src/store/currency-store';
import { useThemeStore } from 'src/store/theme-store';

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
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const tiersSliderRef = useRef<Slider | null>(null);
  const { selectedCurrencyId } = useCurrencyStore();
  const { mode: themeMode } = useThemeStore();
  const activeThemeMode = themeMode ?? 'dark';

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
        setSelectedTierId((prev) =>
          prev && tiersResponse.tiers.some((tier) => tier.id === prev)
            ? prev
            : tiersResponse.tiers[0]?.id ?? null
        );
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
  const tierGradientIndex = useMemo(() => {
    return new Map(sortedTiers.map((tier, index) => [tier.id, index]));
  }, [sortedTiers]);

  const getLevelGradient = useCallback(
    (tierId: string) => {
      const darkGradients = [
        'linear-gradient(135deg, #1f2732 0%, #2b3441 100%)',
        'linear-gradient(135deg, #1b2b3a 0%, #223f55 100%)',
        'linear-gradient(135deg, #2c2036 0%, #3a2548 100%)',
        'linear-gradient(135deg, #2a2b1f 0%, #3b3f2a 100%)',
        'linear-gradient(135deg, #2b1f1f 0%, #3f2a2a 100%)',
        'linear-gradient(135deg, #1f2a2b 0%, #2a3f40 100%)',
      ];
      const lightGradients = [
        'linear-gradient(135deg, #f5f7fa 0%, #e6edf5 100%)',
        'linear-gradient(135deg, #f7f2ff 0%, #e8defa 100%)',
        'linear-gradient(135deg, #eef7ff 0%, #dbe9fb 100%)',
        'linear-gradient(135deg, #fff6e9 0%, #ffe7c7 100%)',
        'linear-gradient(135deg, #fceef0 0%, #f9d9df 100%)',
        'linear-gradient(135deg, #eefbf6 0%, #d7f4ea 100%)',
      ];
      const gradients = activeThemeMode === 'dark' ? darkGradients : lightGradients;
      const index = tierGradientIndex.get(tierId) ?? 0;
      return gradients[index % gradients.length];
    },
    [activeThemeMode, tierGradientIndex]
  );
  const getGradientEndColor = useCallback(
    (gradient: string) => {
      const matches = gradient.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g);
      if (matches && matches.length > 0) {
        return matches[matches.length - 1];
      }
      return activeThemeMode === 'dark' ? '#2b3441' : '#e6edf5';
    },
    [activeThemeMode]
  );
  const formatLevelUpBonus = useCallback(
    (levelUpBonus: { currencyId: string; amount: number }[]) => {
      if (!levelUpBonus.length) return '-';
      const selectedBonus = selectedCurrencyId
        ? levelUpBonus.find((bonus) => bonus.currencyId === selectedCurrencyId)
        : levelUpBonus[0];
      if (!selectedBonus) return '-';
      const currency = currencyMap.get(selectedBonus.currencyId);
      return `${selectedBonus.amount} ${currency?.currencyCode ?? selectedBonus.currencyId}`;
    },
    [currencyMap, selectedCurrencyId]
  );
  const tierLevelItems = useMemo(
    () =>
      sortedTiers.flatMap((tier) => {
        const sortedLevels = [...tier.levels].sort((a, b) => a.levelNumber - b.levelNumber);
        return sortedLevels.map((level) => ({
          tierId: tier.id,
          tierName: tier.tiersName,
          tierIcon: tier.icon,
          level,
        }));
      }),
    [sortedTiers]
  );

  const sliderSettings = useMemo(
    () => ({
      dots: false,
      arrows: false,
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 1,
      swipeToSlide: true,
      responsive: [
        { breakpoint: 1400, settings: { slidesToShow: 4 } },
        { breakpoint: 1200, settings: { slidesToShow: 3 } },
        { breakpoint: 900, settings: { slidesToShow: 2 } },
        { breakpoint: 600, settings: { slidesToShow: 1 } },
      ],
    }),
    []
  );

  const handleTierPrev = () => {
    tiersSliderRef.current?.slickPrev();
  };

  const handleTierNext = () => {
    tiersSliderRef.current?.slickNext();
  };

  const tierLevelsSliderSettings = useMemo(() => {
    return {
      dots: false,
      arrows: false,
      infinite: false,
      speed: 500,
      slidesToShow: 5.2,
      slidesToScroll: 1,
      swipeToSlide: true,
      responsive: [
        { breakpoint: 1400, settings: { slidesToShow: 3.5 } },
        { breakpoint: 1200, settings: { slidesToShow: 3.7 } },
        { breakpoint: 900, settings: { slidesToShow: 2.9 } },
        { breakpoint: 600, settings: { slidesToShow: 1.85 } },
      ],
    };
  }, []);

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
                            {formatLevelUpBonus(currentLevel.levelUpBonus)}
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

        <Stack spacing={2.5} position="relative">
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
                onClick={handleTierPrev}
                sx={{ minWidth: 36, px: 1 }}
              >
                <Iconify icon="eva:arrow-ios-upward-fill" sx={{ transform: 'rotate(-90deg)' }} />
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleTierNext}
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
            <Box sx={{ position: 'relative' }}>
              <Slider ref={tiersSliderRef} {...sliderSettings}>
                {sortedTiers.map((tier) => {
                    const minXP =
                      tier.levels.length > 0
                        ? Math.min(...tier.levels.map((level) => level.xp))
                        : 0;
                    const levelRatio = tier.levels.length / maxTierLevels;
                    const isCurrentTier = currentLevel?.tiersName === tier.tiersName;
                    const isSelected = selectedTierId === tier.id;

                    return (
                      <Box key={tier.id} sx={{ px: 1, userSelect: 'none' }}>
                        <Stack alignItems="center" sx={{ position: 'relative' }}>
                          <Box
                            sx={{
                              width: 180,
                              height: 180,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              '& .tier-icon': {
                                transform: isSelected ? 'scale(1.16)' : 'scale(1)',
                                filter: isSelected
                                  ? 'drop-shadow(0 0px 8px rgba(25, 210, 71, 0.4))'
                                  : 'drop-shadow(0 0 0 rgba(0,0,0,0))',
                              },
                              '&:hover .tier-icon': {
                                // transform: isSelected ? 'scale(1.12)' : 'scale(1.06)',
                                filter: 'drop-shadow(0 0px 10px rgba(25, 210, 71, 0.35))',
                              },
                              '& img': {
                                userSelect: 'none',
                                WebkitUserDrag: 'none',
                              },
                            }}
                            onClick={() => setSelectedTierId(tier.id)}
                          >
                            {tier.icon ? (
                              <Box
                                component="img"
                                src={getImageUrl(tier.icon)}
                                alt={tier.tiersName}
                                className="tier-icon"
                                sx={{
                                  width: 140,
                                  height: 140,
                                  objectFit: 'contain',
                                  transition: (transitionTheme) =>
                                    transitionTheme.transitions.create(['transform', 'filter'], {
                                      duration: transitionTheme.transitions.duration.short,
                                    }),
                                }}
                              />
                            ) : (
                              <Iconify
                                icon="solar:shield-keyhole-bold-duotone"
                                width={180}
                                className="tier-icon"
                                sx={{
                                  transition: (transitionTheme) =>
                                    transitionTheme.transitions.create(['transform', 'filter'], {
                                      duration: transitionTheme.transitions.duration.short,
                                    }),
                                }}
                              />
                            )}
                          </Box>

                          <Box
                            sx={{
                              position: 'relative',
                              width: '100%',
                            }}
                          >
                            {isSelected && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: '50%',
                                  bottom: -7,
                                  width: 14,
                                  height: 14,
                                  borderRadius: '50%',
                                  bgcolor: 'primary.main',
                                  border: '2px solid',
                                  borderColor: 'background.paper',
                                  transform: 'translateX(-50%)',
                                  boxShadow: (shadowTheme) => shadowTheme.shadows[2],
                                  '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    inset: -6,
                                    borderRadius: '50%',
                                    border: '2px solid',
                                    borderColor: 'primary.main',
                                    opacity: 0,
                                    animation: 'tierRipple 1.6s ease-out infinite',
                                  },
                                  '@keyframes tierRipple': {
                                    '0%': {
                                      transform: 'scale(0.6)',
                                      opacity: 0.6,
                                    },
                                    '70%': {
                                      transform: 'scale(1.6)',
                                      opacity: 0.1,
                                    },
                                    '100%': {
                                      transform: 'scale(1.9)',
                                      opacity: 0,
                                    },
                                  },
                                }}
                              />
                            )}
                          </Box>

                          <Stack spacing={0.5} alignItems="center" sx={{ pt: 3 }}>
                            {isCurrentTier && (
                              <Chip label="Current" size="small" color="primary" variant="filled" />
                            )}
                            <Typography
                              variant="h6"
                              align="center"
                              color="primary"
                              style={{ fontWeight: 900 }}
                            >
                              {tier.tiersName}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" style={{ marginTop: 0 }}>
                              <Typography
                                variant="subtitle1"
                                color="primary"
                                align="center"
                                style={{ fontWeight: 900 }}
                              >
                                {minXP.toLocaleString()}
                              </Typography>
                              <Typography variant="subtitle2" color="text.secondary" align="center">
                                XP needed
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })}
              </Slider>
            </Box>
          )}

          {!tiersLoading && !tiersError && sortedTiers.length === 0 && (
            <Typography color="text.secondary">No loyalty tiers configured yet.</Typography>
          )}
          
          <Box sx={{ borderStyle: 'dashed', borderColor: 'rgba(0, 167, 111, 0.4)', borderWidth: 2, position: 'absolute', bottom: 102, left: 0, right: 0 }} />
        </Stack>

        <Stack spacing={2.5}>
          {tiersLoading && <LinearProgress />}
          {tiersError && (
            <Typography color="error" variant="body2">
              {tiersError}
            </Typography>
          )}

          {!tiersLoading && !tiersError && sortedTiers.length > 0 && (
            <Box sx={{ mx: -1 }}>
              {tierLevelItems.length === 0 ? (
                <Typography color="text.secondary">No levels configured for this tier yet.</Typography>
              ) : (
                <Slider {...tierLevelsSliderSettings}>
                  {tierLevelItems.map((item) => {
                    const xpLabel = item.level.xp.toLocaleString();
                    const bonusLabel = formatLevelUpBonus(item.level.levelUpBonus);
                    const benefitRows = [
                      { label: 'Level-Up Bonus', value: bonusLabel },
                      { label: 'Weekly Rakeback', value: `${item.level.weeklyRakeback}%` },
                      { label: 'Monthly Rakeback', value: `${item.level.monthlyRakeback}%` },
                    ];

                    const levelGradient = getLevelGradient(item.tierId);
                    const levelBorderColor = getGradientEndColor(levelGradient);

                    return (
                      <Box key={`${item.tierId}-${item.level.levelNumber}`} sx={{ px: 1 }}>
                        <Card
                          sx={{
                            width: 260,
                            borderRadius: 3,
                            border: '2px solid',
                            borderColor: levelBorderColor,
                            background: levelGradient,
                            color: activeThemeMode === 'dark' ? '#f5f7fa' : '#1f2732',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: 180,
                              background: alpha('#000000', activeThemeMode === 'dark' ? 0.2 : 0.08),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                            }}
                          >
                            {item.tierIcon ? (
                              <Box
                                component="img"
                                src={getImageUrl(item.tierIcon)}
                                alt={item.tierName}
                                sx={{ width: '80%', height: '80%', objectFit: 'contain' }}
                              />
                            ) : (
                              <Iconify icon="solar:shield-keyhole-bold-duotone" width={64} />
                            )}
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: -12,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                px: 1.25,
                                borderRadius: 999,
                                background: alpha(activeThemeMode === 'dark' ? '#888888' : '#ffffff', 0.4),
                                backdropFilter: 'blur(10px)',
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 900, fontStyle: 'italic' }}>
                                Lv.{item.level.levelNumber}
                              </Typography>
                            </Box>
                          </Box>

                          <CardContent sx={{ p: 2.5 }}>
                            <Stack spacing={1.5}>
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 999,
                                    bgcolor: alpha(activeThemeMode === 'dark' ? '#ffffff' : '#000000', 0.04),
                                  }}
                                >
                                  <Iconify icon="solar:check-circle-bold" width={14} />
                                  <Typography variant="caption">
                                    {item.tierName}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 999,
                                    bgcolor: alpha(activeThemeMode === 'dark' ? '#ffffff' : '#000000', 0.04),
                                  }}
                                >
                                  <Iconify icon="solar:eye-bold" width={14} />
                                  <Typography variant="caption">
                                    {`${xpLabel} XP`}
                                  </Typography>
                                </Box>
                              </Stack>

                              <Stack spacing={1}>
                                {benefitRows.map((row) => (
                                  <Stack
                                    key={`${item.tierId}-${item.level.levelNumber}-${row.label}`}
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                  >
                                    <Typography variant="body2">
                                      {row.label}
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                      {row.value}
                                    </Typography>
                                  </Stack>
                                ))}
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Box>
                    );
                  })}
                </Slider>
              )}
            </Box>
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

