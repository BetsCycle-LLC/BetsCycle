import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

const sports = [
  'Football',
  'Basketball',
  'Tennis',
  'Esports',
  'MMA',
  'Baseball',
];

const markets = [
  {
    name: 'Main Lines',
    description: 'Moneyline, spreads, totals, and double chance.',
  },
  {
    name: 'Player Props',
    description: 'Shots, points, aces, and performance specials.',
  },
  {
    name: 'Live Betting',
    description: 'Real-time odds updates with cashout controls.',
  },
];

export function BetsCycleSportsView() {
  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4">Sports</Typography>
          <Typography color="text.secondary">
            Build a live sportsbook experience with real-time odds, trading controls, and cashout.
          </Typography>
        </Stack>

        <Alert severity="info">
          Sportsbook data is delivered via third-party APIs. Configure market mapping and trading
          rules in the sportsbook integration layer.
        </Alert>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Sports Coverage</Typography>
                  {sports.map((item) => (
                    <Typography key={item} color="text.secondary">
                      • {item}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Market Types</Typography>
                  {markets.map((market) => (
                    <Stack key={market.name} spacing={0.5}>
                      <Typography>{market.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {market.description}
                      </Typography>
                    </Stack>
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

