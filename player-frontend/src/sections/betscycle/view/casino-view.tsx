import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

const casinoCategories = [
  'Slots',
  'Live Dealer',
  'Table Games',
  'Jackpot',
  'Instant Win',
  'Game Shows',
];

const providerHighlights = [
  {
    name: 'Provider A',
    focus: 'Slots, jackpot, branded IP',
  },
  {
    name: 'Provider B',
    focus: 'Live dealer, roulette, baccarat',
  },
  {
    name: 'Provider C',
    focus: 'Crash, arcade, instant win',
  },
];

export function BetsCycleCasinoView() {
  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4">Casino Games</Typography>
          <Typography color="text.secondary">
            Integrate multiple casino providers through a unified API layer and show curated lobbies.
          </Typography>
        </Stack>

        <Alert severity="info">
          Casino content is powered by third-party APIs. Connect provider keys to unlock real game
          data, RTP settings, and session tokens.
        </Alert>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Lobby Categories</Typography>
                  <Stack spacing={1}>
                    {casinoCategories.map((category) => (
                      <Typography key={category} color="text.secondary">
                        • {category}
                      </Typography>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Provider Highlights</Typography>
                  {providerHighlights.map((provider) => (
                    <Stack key={provider.name} spacing={0.5}>
                      <Typography>{provider.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {provider.focus}
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

