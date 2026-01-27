import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

const supportChannels = [
  { title: 'Live Chat', detail: '24/7 VIP and general support coverage.' },
  { title: 'Email', detail: 'Support tickets with SLA tracking.' },
  { title: 'Help Center', detail: 'Guides, FAQs, and responsible gaming tools.' },
  { title: 'Community', detail: 'Announcements and social engagement.' },
];

export function BetsCycleSupportView() {
  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4">Support</Typography>
          <Typography color="text.secondary">
            Provide 24/7 assistance, responsible gaming resources, and quick access to help.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {supportChannels.map((channel) => (
            <Grid key={channel.title} size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="h6">{channel.title}</Typography>
                    <Typography color="text.secondary">{channel.detail}</Typography>
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

