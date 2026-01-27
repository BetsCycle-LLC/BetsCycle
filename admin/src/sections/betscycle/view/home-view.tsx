import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

const primaryActions = [
  { label: 'Play Originals', href: '/originals' },
  { label: 'Explore Casino', href: '/casino' },
];

const verticals = [
  {
    title: 'BetsCycle Originals',
    description: 'Provably fair originals with crypto-first UX and fast rounds.',
    badge: 'In-house',
  },
  {
    title: 'Casino Games',
    description: 'Slots, live tables, and providers via third-party casino APIs.',
    badge: 'Third-party',
  },
  {
    title: 'Sportsbook',
    description: 'Pre-match and live markets powered by sportsbook integrations.',
    badge: 'Third-party',
  },
];

const trustPillars = [
  'Provably fair RNG',
  'Instant crypto payouts',
  'Multi-coin wallet',
  'Risk & limits controls',
];

export function BetsCycleHomeView() {
  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={6}>
        <Box
          sx={{
            borderRadius: 3,
            bgcolor: 'background.neutral',
            px: { xs: 3, md: 6 },
            py: { xs: 5, md: 7 },
          }}
        >
          <Stack spacing={3} maxWidth={720}>
            <Chip label="Crypto Gambling Platform" color="primary" sx={{ width: 'fit-content' }} />
            <Typography variant="h3">BetsCycle</Typography>
            <Typography color="text.secondary">
              Build a trusted hub for Originals, Casino, and Sports with integrated crypto wallets,
              responsible gaming, and scalable third-party APIs.
            </Typography>
            <Stack direction="row" spacing={2}>
              {primaryActions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.label === 'Play Originals' ? 'contained' : 'outlined'}
                  href={action.href}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Platform Verticals
          </Typography>
          <Grid container spacing={3}>
            {verticals.map((item) => (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Chip label={item.badge} size="small" sx={{ width: 'fit-content' }} />
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography color="text.secondary">{item.description}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Trust & Safety Pillars
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {trustPillars.map((pill) => (
              <Chip key={pill} label={pill} variant="outlined" />
            ))}
          </Stack>
        </Box>
      </Stack>
    </DashboardContent>
  );
}

