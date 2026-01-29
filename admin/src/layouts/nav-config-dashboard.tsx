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
  action: 'sign-in' | 'logout';
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
    title: 'Overview',
    icon: <Iconify icon="solar:home-angle-bold-duotone" />,
    defaultOpen: true,
    children: [
      {
        type: 'item',
        title: 'Platform Performance',
        path: '/admin/overview/platform-performance',
        icon: <Iconify icon="solar:eye-bold" />,
      },
      {
        type: 'item',
        title: 'Quick Stats',
        path: '/admin/overview/quick-stats',
        icon: <Iconify icon="solar:clock-circle-outline" />,
      },
    ],
  },
  { type: 'subheader', title: 'User Management' },
  {
    type: 'item',
    title: 'All Users',
    icon: <Iconify icon="solar:share-bold" />,
    path: '/admin/users',
  },
  {
    type: 'toggle',
    title: 'Account Verification',
    icon: <Iconify icon="solar:shield-keyhole-bold-duotone" />,
    children: [
      {
        type: 'item',
        title: 'KYC/AML Checks',
        path: '/admin/verification/kyc-aml',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
      {
        type: 'item',
        title: 'Ban/Suspend Users',
        path: '/admin/verification/ban-suspend',
        icon: <Iconify icon="solar:eye-closed-bold" />,
      },
      {
        type: 'item',
        title: 'Wallet Management',
        path: '/admin/verification/wallets',
        icon: <Iconify icon="solar:share-bold" />,
      },
    ],
  },
  { type: 'subheader', title: 'Game & Sportsbook Management' },
  {
    type: 'toggle',
    title: 'Custom Games',
    icon: <Iconify icon="solar:cart-3-bold" />,
    children: [
      {
        type: 'item',
        title: 'Add/Edit Custom Games',
        path: '/admin/games/custom/manage',
        icon: <Iconify icon="solar:pen-bold" />,
      },
      {
        type: 'item',
        title: 'Game Settings',
        path: '/admin/games/custom/settings',
        icon: <Iconify icon="solar:settings-bold-duotone" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Third-Party Games',
    icon: <Iconify icon="solar:eye-bold" />,
    children: [
      {
        type: 'item',
        title: 'API Integrations',
        path: '/admin/games/third-party/integrations',
        icon: <Iconify icon="solar:share-bold" />,
      },
      {
        type: 'item',
        title: 'Manage External API Content',
        path: '/admin/games/third-party/content',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Market Settings',
    icon: <Iconify icon="eva:trending-up-fill" />,
    children: [
      {
        type: 'item',
        title: 'Set Sports Betting Odds',
        path: '/admin/markets/odds',
        icon: <Iconify icon="eva:trending-up-fill" />,
      },
      {
        type: 'item',
        title: 'Configure Markets',
        path: '/admin/markets/config',
        icon: <Iconify icon="solar:settings-bold-duotone" />,
      },
    ],
  },
  { type: 'subheader', title: 'Betting & Revenue' },
  {
    type: 'toggle',
    title: 'Betting Analytics',
    icon: <Iconify icon="eva:trending-up-fill" />,
    children: [
      {
        type: 'item',
        title: 'Betting History & Trends',
        path: '/admin/betting/analytics/history',
        icon: <Iconify icon="eva:done-all-fill" />,
      },
      {
        type: 'item',
        title: 'Revenue from Bets',
        path: '/admin/betting/analytics/revenue',
        icon: <Iconify icon="eva:trending-up-fill" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Revenue Share',
    icon: <Iconify icon="solar:share-bold" />,
    children: [
      {
        type: 'item',
        title: 'Set Revenue Share Percentage',
        path: '/admin/revenue/share/settings',
        icon: <Iconify icon="solar:settings-bold-duotone" />,
      },
      {
        type: 'item',
        title: 'Monitor Distribution to Stakers',
        path: '/admin/revenue/share/distribution',
        icon: <Iconify icon="solar:eye-bold" />,
      },
    ],
  },
  { type: 'subheader', title: 'Staking & Revenue Share' },
  {
    type: 'toggle',
    title: 'Staking Pools',
    icon: <Iconify icon="solar:share-bold" />,
    children: [
      {
        type: 'item',
        title: 'Create & Manage Pools',
        path: '/admin/staking/pools/manage',
        icon: <Iconify icon="solar:pen-bold" />,
      },
      {
        type: 'item',
        title: 'Manage Stakeholder Payouts',
        path: '/admin/staking/pools/payouts',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Revenue Distribution',
    icon: <Iconify icon="eva:trending-up-fill" />,
    children: [
      {
        type: 'item',
        title: 'Set Revenue Pool Allocation',
        path: '/admin/staking/revenue/allocation',
        icon: <Iconify icon="solar:settings-bold-duotone" />,
      },
      {
        type: 'item',
        title: 'View Revenue Share Statistics',
        path: '/admin/staking/revenue/statistics',
        icon: <Iconify icon="solar:eye-bold" />,
      },
    ],
  },
  { type: 'subheader', title: 'Promotions & Bonuses' },
  {
    type: 'toggle',
    title: 'Bonus Management',
    icon: <Iconify icon="eva:checkmark-fill" />,
    children: [
      {
        type: 'item',
        title: 'Manage Promotions',
        path: '/admin/promotions/manage',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
      {
        type: 'item',
        title: 'Tournaments and Events',
        path: '/admin/promotions/tournaments',
        icon: <Iconify icon="eva:trending-up-fill" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Affiliate Promotions',
    icon: <Iconify icon="solar:share-bold" />,
    children: [
      {
        type: 'item',
        title: 'Create Affiliate Campaigns',
        path: '/admin/promotions/affiliates',
        icon: <Iconify icon="solar:pen-bold" />,
      },
    ],
  },
  { type: 'subheader', title: 'Reports & Analytics' },
  {
    type: 'toggle',
    title: 'Player Analytics',
    icon: <Iconify icon="eva:trending-up-fill" />,
    children: [
      {
        type: 'item',
        title: 'Player Activity Trends',
        path: '/admin/reports/players/activity',
        icon: <Iconify icon="eva:trending-up-fill" />,
      },
      {
        type: 'item',
        title: 'Revenue Analytics',
        path: '/admin/reports/players/revenue',
        icon: <Iconify icon="eva:trending-up-fill" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Fraud & Risk Reports',
    icon: <Iconify icon="solar:shield-keyhole-bold-duotone" />,
    children: [
      {
        type: 'item',
        title: 'Suspicious Activity Monitoring',
        path: '/admin/reports/fraud/activity',
        icon: <Iconify icon="solar:eye-bold" />,
      },
      {
        type: 'item',
        title: 'Payout Audit Logs',
        path: '/admin/reports/fraud/audits',
        icon: <Iconify icon="eva:done-all-fill" />,
      },
    ],
  },
  { type: 'subheader', title: 'Compliance & Security' },
  {
    type: 'toggle',
    title: 'User Security',
    icon: <Iconify icon="solar:shield-keyhole-bold-duotone" />,
    children: [
      {
        type: 'item',
        title: 'Two-Factor Authentication',
        path: '/admin/security/2fa',
        icon: <Iconify icon="solar:shield-keyhole-bold-duotone" />,
      },
      {
        type: 'item',
        title: 'Wallet Security Settings',
        path: '/admin/security/wallet',
        icon: <Iconify icon="solar:settings-bold-duotone" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Compliance',
    icon: <Iconify icon="solar:settings-bold-duotone" />,
    children: [
      {
        type: 'item',
        title: 'KYC/AML Settings',
        path: '/admin/compliance/kyc-aml',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
      {
        type: 'item',
        title: 'Audit Logs',
        path: '/admin/compliance/audit-logs',
        icon: <Iconify icon="eva:done-all-fill" />,
      },
    ],
  },
  { type: 'subheader', title: 'System Settings' },
  {
    type: 'item',
    title: 'Currency Management',
    icon: <Iconify icon="solar:wallet-bold" />,
    path: '/admin/settings/currency',
  },
  {
    type: 'toggle',
    title: 'Platform Configuration',
    icon: <Iconify icon="solar:settings-bold-duotone" />,
    children: [
      {
        type: 'item',
        title: 'General Platform Settings',
        path: '/admin/settings/platform',
        icon: <Iconify icon="solar:settings-bold-duotone" />,
      },
      {
        type: 'item',
        title: 'API Configuration',
        path: '/admin/settings/api',
        icon: <Iconify icon="solar:share-bold" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Payment Settings',
    icon: <Iconify icon="solar:share-bold" />,
    children: [
      {
        type: 'item',
        title: 'Manage Payment Gateways',
        path: '/admin/settings/payments/gateways',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
      {
        type: 'item',
        title: 'Configure Transaction Fees',
        path: '/admin/settings/payments/fees',
        icon: <Iconify icon="solar:settings-bold-duotone" />,
      },
    ],
  },
  { type: 'subheader', title: 'Support & Helpdesk' },
  {
    type: 'toggle',
    title: 'Manage Tickets',
    icon: <Iconify icon="solar:chat-round-dots-bold" />,
    children: [
      {
        type: 'item',
        title: 'View Open Tickets',
        path: '/admin/support/tickets/open',
        icon: <Iconify icon="solar:chat-round-dots-bold" />,
      },
      {
        type: 'item',
        title: 'Resolve User Issues',
        path: '/admin/support/tickets/resolve',
        icon: <Iconify icon="solar:check-circle-bold" />,
      },
    ],
  },
  {
    type: 'toggle',
    title: 'Help Articles',
    icon: <Iconify icon="solar:eye-bold" />,
    children: [
      {
        type: 'item',
        title: 'Create/Update Help Articles',
        path: '/admin/support/articles/manage',
        icon: <Iconify icon="solar:pen-bold" />,
      },
      {
        type: 'item',
        title: 'FAQs',
        path: '/admin/support/articles/faqs',
        icon: <Iconify icon="solar:eye-bold" />,
      },
    ],
  },
  {
    type: 'action',
    title: 'Log Out',
    action: 'logout',
    icon: <Iconify icon="eva:arrow-ios-forward-fill" />,
  },
];
