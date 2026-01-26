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
  { type: 'subheader', title: 'Main Navigation' },
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
        title: 'Current Balance (Normal & Staking)',
        path: '/dashboard',
        icon: <Iconify icon="solar:share-bold" />,
      },
      {
        type: 'item',
        title: 'Recent Bet History (Normal Player)',
        path: '/dashboard',
        icon: <Iconify icon="solar:clock-circle-outline" />,
      },
      {
        type: 'item',
        title: 'Staking Overview (Staking Player)',
        path: '/dashboard',
        icon: <Iconify icon="eva:trending-up-fill" />,
      },
      {
        type: 'item',
        title: 'Quick Access to Active Games/Markets',
        path: '/dashboard',
        icon: <Iconify icon="eva:trending-up-fill" />,
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
        title: 'Popular Slots',
        path: '/casino',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
      {
        type: 'item',
        title: 'New Slots',
        path: '/casino',
        icon: <Iconify icon="solar:clock-circle-outline" />,
      },
      {
        type: 'item',
        title: 'Blackjack, Roulette, Poker',
        path: '/casino',
        icon: <Iconify icon="solar:pen-bold" />,
      },
      {
        type: 'item',
        title: 'Baccarat, Craps',
        path: '/casino',
        icon: <Iconify icon="solar:pen-bold" />,
      },
      {
        type: 'item',
        title: 'Live Casino Games',
        path: '/casino',
        icon: <Iconify icon="solar:eye-bold" />,
      },
      {
        type: 'item',
        title: 'Table Availability & Betting Limits',
        path: '/casino',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Sportsbook',
    icon: <Iconify icon="solar:eye-bold" />,
    children: [
      {
        type: 'item',
        title: 'Upcoming Matches & Odds',
        path: '/sports',
        icon: <Iconify icon="solar:clock-circle-outline" />,
      },
      {
        type: 'item',
        title: 'Live Betting Options',
        path: '/sports',
        icon: <Iconify icon="eva:trending-up-fill" />,
      },
      {
        type: 'item',
        title: 'View Active & Completed Bets',
        path: '/sports',
        icon: <Iconify icon="eva:done-all-fill" />,
      },
      {
        type: 'item',
        title: 'Track Betting Performance',
        path: '/sports',
        icon: <Iconify icon="eva:trending-up-fill" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Staking',
    icon: <Iconify icon="solar:share-bold" />,
    children: [
      {
        type: 'item',
        title: 'Total Staked Amount',
        path: '/wallet',
        icon: <Iconify icon="solar:share-bold" />,
      },
      {
        type: 'item',
        title: 'Current Rewards & Earnings',
        path: '/wallet',
        icon: <Iconify icon="eva:trending-up-fill" />,
      },
      {
        type: 'item',
        title: 'Stake Pool Performance',
        path: '/wallet',
        icon: <Iconify icon="eva:trending-up-fill" />,
      },
      {
        type: 'item',
        title: 'Active Pools',
        path: '/wallet',
        icon: <Iconify icon="solar:eye-bold" />,
      },
      {
        type: 'item',
        title: 'Join/Leave Pools',
        path: '/wallet',
        icon: <Iconify icon="solar:restart-bold" />,
      },
      {
        type: 'item',
        title: 'View Pool Status & Rewards',
        path: '/wallet',
        icon: <Iconify icon="solar:eye-bold" />,
      },
      {
        type: 'item',
        title: 'Earnings Breakdown from Staking',
        path: '/wallet',
        icon: <Iconify icon="eva:trending-up-fill" />,
      },
      {
        type: 'item',
        title: 'Pending & Paid Earnings',
        path: '/wallet',
        icon: <Iconify icon="solar:clock-circle-outline" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Bonuses & Promotions',
    icon: <Iconify icon="solar:share-bold" />,
    children: [
      {
        type: 'item',
        title: 'Welcome Bonus, Free Spins, Cashback Offers',
        path: '/promotions',
        icon: <Iconify icon="eva:checkmark-fill" />,
      },
      {
        type: 'item',
        title: 'Participate in Tournaments',
        path: '/vip',
        icon: <Iconify icon="eva:trending-up-fill" />,
      },
      {
        type: 'item',
        title: 'View Leaderboard',
        path: '/vip',
        icon: <Iconify icon="eva:done-all-fill" />,
      },
      {
        type: 'item',
        title: 'Special Rewards for Stakers',
        path: '/vip',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
      {
        type: 'item',
        title: 'Loyalty & VIP Bonuses for Stakers',
        path: '/vip',
        icon: <Iconify icon="solar:shield-keyhole-bold-duotone" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Transaction History',
    icon: <Iconify icon="eva:trending-down-fill" />,
    children: [
      {
        type: 'item',
        title: 'View All Transactions (Normal & Staking)',
        path: '/wallet',
        icon: <Iconify icon="eva:done-all-fill" />,
      },
      {
        type: 'item',
        title: 'Deposit Funds (Crypto Wallet)',
        path: '/wallet',
        icon: <Iconify icon="solar:share-bold" />,
      },
      {
        type: 'item',
        title: 'Request Withdrawal',
        path: '/wallet',
        icon: <Iconify icon="solar:share-bold" />,
      },
      {
        type: 'item',
        title: 'View Past Bets & Outcomes (Normal Player)',
        path: '/sports',
        icon: <Iconify icon="eva:done-all-fill" />,
      },
      {
        type: 'item',
        title: 'Deposit/Withdraw Staked Tokens',
        path: '/wallet',
        icon: <Iconify icon="solar:share-bold" />,
      },
      {
        type: 'item',
        title: 'View Stake History & Payouts',
        path: '/wallet',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Wallet & Deposit',
    icon: <Iconify icon="solar:share-bold" />,
    children: [
      {
        type: 'item',
        title: 'View Balance & Transaction History',
        path: '/wallet',
        icon: <Iconify icon="solar:eye-bold" />,
      },
      {
        type: 'item',
        title: 'Deposit Crypto or Tokens',
        path: '/wallet',
        icon: <Iconify icon="solar:share-bold" />,
      },
      {
        type: 'item',
        title: 'Withdraw Funds to Wallet',
        path: '/wallet',
        icon: <Iconify icon="solar:share-bold" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Account Settings',
    icon: <Iconify icon="solar:settings-bold-duotone" />,
    children: [
      {
        type: 'item',
        title: 'Update Email, Username, Password',
        path: '/user',
        icon: <Iconify icon="solar:pen-bold" />,
      },
      {
        type: 'item',
        title: 'Set Up Two-Factor Authentication (2FA)',
        path: '/user',
        icon: <Iconify icon="solar:shield-keyhole-bold-duotone" />,
      },
      {
        type: 'item',
        title: 'Set Betting Limits',
        path: '/user',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
      {
        type: 'item',
        title: 'Self-Exclusion Options',
        path: '/user',
        icon: <Iconify icon="solar:eye-closed-bold" />,
      },
      {
        type: 'item',
        title: 'Manage Staking Preferences',
        path: '/user',
        icon: <Iconify icon="solar:settings-bold-duotone" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Support & Help',
    icon: <Iconify icon="solar:chat-round-dots-bold" />,
    children: [
      {
        type: 'item',
        title: 'View Active Support Tickets',
        path: '/support',
        icon: <Iconify icon="solar:chat-round-dots-bold" />,
      },
      {
        type: 'item',
        title: 'FAQ and Help Articles',
        path: '/support',
        icon: <Iconify icon="solar:eye-bold" />,
      },
      {
        type: 'item',
        title: 'Help with Staking Issues',
        path: '/support',
        icon: <Iconify icon="solar:chat-round-dots-bold" />,
      },
      {
        type: 'item',
        title: 'Staking FAQs and Guides',
        path: '/support',
        icon: <Iconify icon="solar:eye-bold" />,
      },
    ],
  },
  {
    type: 'item',
    title: 'Log Out',
    path: '/sign-in',
    icon: <Iconify icon="eva:arrow-ios-forward-fill" />,
  },
];
