import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

const coins = [
  { code: 'BTC', label: 'Bitcoin' },
  { code: 'ETH', label: 'Ethereum' },
  { code: 'USDT', label: 'Tether' },
  { code: 'SOL', label: 'Solana' },
  { code: 'LTC', label: 'Litecoin' },
  { code: 'TRX', label: 'Tron' },
];

const walletFeatures = [
  'Instant deposits',
  'Auto-withdrawals',
  'Network fee display',
  'Address whitelisting',
];

export function BetsCycleWalletView() {
  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4">Wallet</Typography>
          <Typography color="text.secondary">
            Support multi-coin balances with real-time confirmations and automated payouts.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Supported Coins</Typography>
                  <Grid container spacing={2}>
                    {coins.map((coin) => (
                      <Grid key={coin.code} size={{ xs: 6 }}>
                        <Stack spacing={0.5}>
                          <Typography>{coin.code}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {coin.label}
                          </Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Wallet Controls</Typography>
                  {walletFeatures.map((feature) => (
                    <Typography key={feature} color="text.secondary">
                      • {feature}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </DashboardContent>
  );
}

