import { useCallback, useEffect, useMemo, useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';

import { useSnackbar } from 'notistack';

import { useAuth } from 'src/auth/use-auth';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  fetchAdminLoyaltyTiers,
  updateAdminLoyaltyTier,
  type LoyaltyTier,
} from 'src/services/loyalty-api';
import { fetchAdminCurrencies, type AdminCurrency } from 'src/services/currency-api';

export function FaucetManagementView() {
  const { token } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [currencies, setCurrencies] = useState<AdminCurrency[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const activeCurrencies = useMemo(
    () => currencies.filter((currency) => currency.status === 'active' && currency.currencyType === 'crypto'),
    [currencies]
  );

  const buildAmounts = useCallback(
    (tierList: LoyaltyTier[], currencyList: AdminCurrency[]) => {
      const rewardMap = new Map<string, number>();
      tierList.forEach((tier) => {
        tier.levels.forEach((level) => {
          (level.faucetRewards ?? []).forEach((reward) => {
            if (!rewardMap.has(reward.currencyId)) {
              rewardMap.set(reward.currencyId, reward.amount);
            }
          });
        });
      });

      const next: Record<string, string> = {};
      currencyList.forEach((currency) => {
        const value = rewardMap.get(currency.id);
        next[currency.id] = value !== undefined ? String(value) : '0';
      });
      return next;
    },
    []
  );

  const loadData = useCallback(() => {
    if (!token) return;
    setLoading(true);

    Promise.all([fetchAdminLoyaltyTiers(token), fetchAdminCurrencies(token)])
      .then(([tiersResponse, currenciesResponse]) => {
        setCurrencies(currenciesResponse.currencies);
        const active = currenciesResponse.currencies.filter(
          (currency) => currency.status === 'active' && currency.currencyType === 'crypto'
        );
        setTiers(tiersResponse.tiers);
        setAmounts(buildAmounts(tiersResponse.tiers, active));
      })
      .catch((error: Error) => {
        enqueueSnackbar(error.message || 'Failed to load faucet settings.', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  }, [buildAmounts, enqueueSnackbar, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAmountChange = (currencyId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setAmounts((prev) => ({ ...prev, [currencyId]: value }));
  };

  const handleSaveAll = async () => {
    if (!token) return;
    setSaving(true);

    const rewardPayload = activeCurrencies.map((currency) => ({
      currencyId: currency.id,
      amount: Number(amounts[currency.id] ?? 0),
    }));

    try {
      await Promise.all(
        tiers.map((tier) => {
          const levels = tier.levels.map((level) => ({
            levelNumber: level.levelNumber,
            xp: level.xp,
            faucetInterval: level.faucetInterval ?? 0,
            faucetRewards: rewardPayload,
            weeklyRakeback: level.weeklyRakeback,
            monthlyRakeback: level.monthlyRakeback,
            levelUpBonus: level.levelUpBonus,
          }));
          return updateAdminLoyaltyTier(token, tier.id, { levels });
        })
      );
      enqueueSnackbar('Faucet rewards updated for all tiers.', { variant: 'success' });
      loadData();
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Failed to update faucet rewards.', {
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4">Free Crypto Faucet</Typography>
          <Typography color="text.secondary">
            Set the faucet reward amounts per currency. Claim intervals are managed in Loyalty Club Management.
          </Typography>
        </Stack>

        {loading && <LinearProgress />}

        {!loading && activeCurrencies.length === 0 && (
          <Card>
            <CardContent>
              <Typography color="text.secondary">No active crypto currencies are available.</Typography>
            </CardContent>
          </Card>
        )}

        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h6">Faucet Reward Amounts</Typography>
                <Grid container spacing={2}>
                  {activeCurrencies.map((currency) => (
                    <Grid key={currency.id} size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label={`${currency.currencyCode} Amount`}
                        value={amounts[currency.id] ?? '0'}
                        onChange={handleAmountChange(currency.id)}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Button
                  variant="contained"
                  onClick={handleSaveAll}
                  disabled={saving || activeCurrencies.length === 0 || tiers.length === 0}
                >
                  {saving ? 'Saving...' : 'Save Faucet Rewards'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </DashboardContent>
  );
}


