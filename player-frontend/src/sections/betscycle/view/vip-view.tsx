import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

const tiers = [
  { name: 'Bronze', perks: 'Weekly cashback, faster withdrawals' },
  { name: 'Silver', perks: 'Dedicated support, higher limits' },
  { name: 'Gold', perks: 'Personal host, custom bonuses' },
  { name: 'Platinum', perks: 'Exclusive events, premium rewards' },
];

export function BetsCycleVipView() {
  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4">VIP Program</Typography>
          <Typography color="text.secondary">
            Reward high-value players with tiered perks, cashback, and personal support.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {tiers.map((tier) => (
            <Grid key={tier.name} size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="h6">{tier.name}</Typography>
                    <Typography color="text.secondary">{tier.perks}</Typography>
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

