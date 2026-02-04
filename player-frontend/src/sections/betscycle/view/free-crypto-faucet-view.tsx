import { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';

import { useSnackbar } from 'notistack';

import { useAuth } from 'src/auth/use-auth';
import { DashboardContent } from 'src/layouts/dashboard';
import { claimFaucet, fetchFaucetStatus, type FaucetEntry, type FaucetStatusResponse } from 'src/services/faucet-api';

type ClaimDialogState = {
  open: boolean;
  faucet: FaucetEntry | null;
  claimedAmount?: number;
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
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

const getCurrencyIcon = (symbol?: string) => {
  if (!symbol) return '';
  if (symbol.startsWith('http') || symbol.startsWith('/uploads')) {
    return getImageUrl(symbol);
  }
  return '';
};

export function BetsCycleFreeCryptoFaucetView() {
  const { user, token, openAuthDialog } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [status, setStatus] = useState<FaucetStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimDialog, setClaimDialog] = useState<ClaimDialogState>({
    open: false,
    faucet: null,
  });

  const refreshStatus = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchFaucetStatus(token)
      .then((response) => setStatus(response))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load faucet status');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (user && token) {
      refreshStatus();
    } else {
      setStatus(null);
      setError(null);
    }
  }, [refreshStatus, token, user]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const handleCloseClaim = () => {
    setClaimDialog({ open: false, faucet: null, claimedAmount: undefined });
  };

  const handleClaim = async (faucet: FaucetEntry) => {
    if (!token) return;
    setClaimingId(faucet.currencyId);
    try {
      const response = await claimFaucet(token, faucet.currencyId);
      enqueueSnackbar('Faucet claimed successfully.', { variant: 'success' });
      setClaimDialog({
        open: true,
        faucet,
        claimedAmount: response.claimed.amount,
      });
      refreshStatus();
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'Failed to claim faucet.', { variant: 'error' });
    } finally {
      setClaimingId(null);
    }
  };

  const faucetsWithTiming = useMemo(() => {
    if (!status?.faucets) return [];
    return status.faucets.map((faucet) => {
      const nextClaimAtMs = faucet.nextClaimAt ? new Date(faucet.nextClaimAt).getTime() : null;
      const timeRemainingMs = nextClaimAtMs ? Math.max(0, nextClaimAtMs - now) : 0;
      const canClaim = faucet.amount > 0 && (nextClaimAtMs ? timeRemainingMs === 0 : faucet.canClaim);
      return { ...faucet, timeRemainingMs, canClaim };
    });
  }, [now, status?.faucets]);

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4">Free Crypto Faucet</Typography>
          <Typography color="text.secondary">
            Claim free crypto based on your loyalty level. Faucets refresh on the interval set for your tier.
          </Typography>
        </Stack>

        {!user && (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Sign in to claim your faucet rewards.</Typography>
                <Button
                  variant="contained"
                  onClick={() => openAuthDialog('sign-in')}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Sign In
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {user && loading && <LinearProgress />}
        {user && error && (
          <Card>
            <CardContent>
              <Typography color="error">{error}</Typography>
            </CardContent>
          </Card>
        )}

        {user && !loading && !error && (
          <Stack spacing={3}>
            <Grid container spacing={3}>
              {faucetsWithTiming.map((faucet) => (
                <Grid key={faucet.currencyId} size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack spacing={2} position="relative">
                        <Typography variant="subtitle1">
                          Free {faucet.currencyName || faucet.currencyCode || 'Crypto'} Faucet
                        </Typography>

                        <Box position="absolute" top={0} right={0} sx={{ mt: 0 }}>
                          <Avatar
                            src={getCurrencyIcon(faucet.symbol) || undefined}
                            alt={faucet.currencyName || faucet.currencyCode || 'Currency'}
                            sx={{ width: 64, height: 64, mt: 0 }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="subtitle1" color="text.secondary">
                            Available to claim:
                          </Typography>
                          <Typography variant="h5" sx={{ mt: 1 }}>
                            {faucet.amount} {faucet.currencyCode}
                          </Typography>
                        </Box>

                        <Button
                          variant="contained"
                          onClick={() => handleClaim(faucet)}
                          disabled={!faucet.canClaim || claimingId === faucet.currencyId}
                        >
                          {faucet.canClaim ? 'Claim' : formatDuration(faucet.timeRemainingMs)}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {faucetsWithTiming.length === 0 && (
                <Grid size={{ xs: 12 }}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary">No faucet rewards configured.</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Stack>
        )}
      </Stack>

      <Dialog open={claimDialog.open} onClose={handleCloseClaim} maxWidth="sm" fullWidth>
        <DialogTitle>Faucet Claimed</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography color="success.main">
              Successfully claimed {claimDialog.claimedAmount ?? 0} {claimDialog.faucet?.currencyCode ?? ''}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClaim}>Close</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}


