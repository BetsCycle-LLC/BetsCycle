import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

const originals = [
  {
    name: 'Dice',
    description: 'Classic over/under with adjustable odds and instant results.',
    tags: ['Provably fair', 'Fast rounds'],
  },
  {
    name: 'Plinko',
    description: 'Risk-based multipliers and auto-drop strategies.',
    tags: ['Auto play', 'Multipliers'],
  },
  {
    name: 'Crash',
    description: 'Cash out before the multiplier bursts.',
    tags: ['Live', 'High volatility'],
  },
  {
    name: 'Hilo',
    description: 'Predict higher/lower and chain your streak.',
    tags: ['Streaks', 'Instant settle'],
  },
  {
    name: 'Roulette',
    description: 'Crypto-first tables with fast spins.',
    tags: ['Single table', 'Lightning'],
  },
];

export function BetsCycleOriginalsView() {
  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4">BetsCycle Originals</Typography>
          <Typography color="text.secondary">
            Curated in-house games with transparent RNG, real-time stats, and flexible staking.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {originals.map((game) => (
            <Grid key={game.name} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">{game.name}</Typography>
                    <Typography color="text.secondary">{game.description}</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {game.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Stack>
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

