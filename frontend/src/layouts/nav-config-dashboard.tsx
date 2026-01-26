import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type NavItemBase = {
  title: string;
};

type NavItemLink = NavItemBase & {
  type: 'item';
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export type NavItem =
  | NavItemLink
  | (NavItemBase & {
      type: 'toggle';
      icon: React.ReactNode;
      defaultOpen?: boolean;
      children: NavItemLink[];
    })
  | (NavItemBase & {
      type: 'subheader';
    });

export const navData: NavItem[] = [
  { type: 'subheader', title: 'Crypto Originals' },
  {
    type: 'item',
    title: 'Home',
    path: '/',
    icon: <Iconify icon="solar:home-angle-bold-duotone" />,
  },
  {
    type: 'item',
    title: 'Originals (Dice, Crash, Mines)',
    path: '/originals',
    icon: <Iconify icon="solar:restart-bold" />,
    info: (
      <Label color="info" variant="inverted">
        Provably Fair
      </Label>
    ),
  },
  {
    type: 'item',
    title: 'Bets Races',
    path: '/promotions',
    icon: <Iconify icon="eva:trending-up-fill" />,
  },
  {
    type: 'item',
    title: 'Leaderboard',
    path: '/vip',
    icon: <Iconify icon="eva:done-all-fill" />,
  },
  { type: 'subheader', title: 'Casino Games' },
  {
    type: 'item',
    title: 'Casino Lobby',
    path: '/casino',
    icon: <Iconify icon="solar:cart-3-bold" />,
  },
  {
    type: 'item',
    title: 'Live Casino',
    path: '/casino',
    icon: <Iconify icon="solar:eye-bold" />,
    info: (
      <Label color="error" variant="inverted">
        Live
      </Label>
    ),
  },
  {
    type: 'item',
    title: 'Slots',
    path: '/casino',
    icon: <Iconify icon="solar:restart-bold" />,
  },
  {
    type: 'item',
    title: 'Table Games',
    path: '/casino',
    icon: <Iconify icon="solar:pen-bold" />,
  },
  {
    type: 'item',
    title: 'Jackpots',
    path: '/casino',
    icon: <Iconify icon="solar:check-circle-bold" />,
  },
  { type: 'subheader', title: 'Sportsbook' },
  {
    type: 'item',
    title: 'Sportsbook',
    path: '/sports',
    icon: <Iconify icon="solar:eye-bold" />,
  },
  {
    type: 'item',
    title: 'Live Betting',
    path: '/sports',
    icon: <Iconify icon="eva:trending-up-fill" />,
    info: (
      <Label color="warning" variant="inverted">
        Live
      </Label>
    ),
  },
  {
    type: 'item',
    title: 'Upcoming',
    path: '/sports',
    icon: <Iconify icon="solar:clock-circle-outline" />,
  },
  {
    type: 'item',
    title: 'Results',
    path: '/sports',
    icon: <Iconify icon="eva:done-all-fill" />,
  },
  { type: 'subheader', title: 'Rewards & Community' },
  {
    type: 'toggle',
    title: 'Rewards Center',
    icon: <Iconify icon="solar:check-circle-bold" />,
    defaultOpen: true,
    children: [
      {
        type: 'item',
        title: 'Daily Bonus',
        path: '/promotions',
        icon: <Iconify icon="solar:clock-circle-outline" />,
      },
      {
        type: 'item',
        title: 'Cashback',
        path: '/promotions',
        icon: <Iconify icon="solar:share-bold" />,
      },
      {
        type: 'item',
        title: 'VIP Club',
        path: '/vip',
        icon: <Iconify icon="solar:shield-keyhole-bold-duotone" />,
      },
      {
        type: 'item',
        title: 'Affiliates',
        path: '/support',
        icon: <Iconify icon="eva:checkmark-fill" />,
      },
    ],
  },
  {
    type: 'item',
    title: 'Wallet & Vault',
    path: '/wallet',
    icon: <Iconify icon="solar:share-bold" />,
  },
  {
    type: 'item',
    title: 'Support',
    path: '/support',
    icon: <Iconify icon="solar:chat-round-dots-bold" />,
  },
];
