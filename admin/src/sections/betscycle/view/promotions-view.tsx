import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

const promotions = [
  {
    title: 'Welcome Bonus',
    detail: 'Crypto match bonus with wagering requirements.',
  },
  {
    title: 'Weekly Reloads',
    detail: 'Automatic reload bonuses based on VIP tier.',
  },
  {
    title: 'Tournaments',
    detail: 'Originals and slots leaderboards with prize pools.',
  },
  {
    title: 'Cashback',
    detail: 'Daily or weekly cashback on net losses.',
  },
];

export function BetsCyclePromotionsView() {
  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4">Promotions</Typography>
          <Typography color="text.secondary">
            Plan retention campaigns, bonuses, and tournaments across Originals, Casino, and Sports.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {promotions.map((promo) => (
            <Grid key={promo.title} size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="h6">{promo.title}</Typography>
                    <Typography color="text.secondary">{promo.detail}</Typography>
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

