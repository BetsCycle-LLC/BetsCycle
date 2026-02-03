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

type NavItemAction = NavItemBase & {
  type: 'action';
  action: 'sign-in' | 'sign-up' | 'logout';
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export type NavItem =
  | NavItemLink
  | NavItemAction
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
  { type: 'subheader', title: 'Dashboard' },
  {
    type: 'toggle',
    title: 'Dashboard',
    icon: <Iconify icon="solar:home-angle-bold-duotone" />,
    defaultOpen: true,
    children: [
      {
        type: 'item',
        title: 'Overview',
        path: '/dashboard',
        icon: <Iconify icon="solar:eye-bold" />,
      },
      {
        type: 'item',
        title: 'Current Balance',
        path: '/dashboard/balance',
        icon: <Iconify icon="solar:share-bold" />,
      },
      {
        type: 'item',
        title: 'Recent Bet History',
        path: '/dashboard/bet-history',
        icon: <Iconify icon="solar:clock-circle-outline" />,
      },
      {
        type: 'item',
        title: 'Staking Overview',
        path: '/dashboard/staking',
        icon: <Iconify icon="eva:trending-up-fill" />,
      }
    ],
  },
  { type: 'subheader', title: 'Games & Sports' },
  {
    type: 'toggle',
    title: 'Original Games',
    icon: <Iconify icon="solar:cart-3-bold" />,
    children: [
      {
        type: 'item',
        title: 'Slots',
        path: '/casino?tab=slots',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
      {
        type: 'item',
        title: 'New Slots',
        path: '/casino?tab=new-slots',
        icon: <Iconify icon="solar:clock-circle-outline" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Casino Games',
    icon: <Iconify icon="solar:cart-3-bold" />,
    children: [
      {
        type: 'item',
        title: 'Slots',
        path: '/casino?tab=slots',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
      {
        type: 'item',
        title: 'Live Casino',
        path: '/casino?tab=new-slots',
        icon: <Iconify icon="solar:clock-circle-outline" />,
      },
      {
        type: 'item',
        title: 'Turbo Games',
        path: '/casino',
        icon: <Iconify icon="solar:pen-bold" />,
      },
      {
        type: 'item',
        title: 'Poker',
        path: '/casino',
        icon: <Iconify icon="solar:pen-bold" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Sports',
    icon: <Iconify icon="solar:eye-bold" />,
    children: [
      {
        type: 'item',
        title: 'Football',
        path: '/sports',
        icon: <Iconify icon="solar:clock-circle-outline" />,
      },
      {
        type: 'item',
        title: 'BasketBall',
        path: '/sports',
        icon: <Iconify icon="eva:trending-up-fill" />,
      },
      {
        type: 'item',
        title: 'E-Sports',
        path: '/sports',
        icon: <Iconify icon="eva:done-all-fill" />,
      },
    ],
  },
  { type: 'subheader', title: 'For You' },
  {
    type: 'toggle',
    title: 'Bonuses',
    icon: <Iconify icon="solar:share-bold" />,
    children: [
      {
        type: 'item',
        title: 'Free Crypto Faucet',
        path: '/promotions',
        icon: <Iconify icon="eva:checkmark-fill" />,
      },
      {
        type: 'item',
        title: 'Bonus Vault',
        path: '/vip',
        icon: <Iconify icon="eva:done-all-fill" />,
      },
    ],
  },
  {
    type: 'item',
    title: 'BCY Token',
    path: '/bcy-tokens',
    icon: <Iconify icon="eva:trending-up-fill" />,
  },
  {
    type: 'item',
    title: 'Promotions',
    icon: <Iconify icon="solar:check-circle-bold" />,
    path: '/promotions',
  },
  {
    type: 'item',
    title: 'Loyalty Club',
    icon: <Iconify icon="solar:check-circle-bold" />,
    path: '/loyalty-club',
  },
  {
    type: 'action',
    title: 'Log Out',
    action: 'logout',
    icon: <Iconify icon="eva:arrow-ios-forward-fill" />,
  },
];
