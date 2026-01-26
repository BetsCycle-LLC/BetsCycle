import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Home',
    path: '/',
    icon: <Iconify icon="solar:home-angle-bold-duotone" />,
  },
  {
    title: 'Originals',
    path: '/originals',
    icon: <Iconify icon="solar:restart-bold" />,
  },
  {
    title: 'Casino',
    path: '/casino',
    icon: <Iconify icon="solar:cart-3-bold" />,
  },
  {
    title: 'Sports',
    path: '/sports',
    icon: <Iconify icon="solar:eye-bold" />,
  },
  {
    title: 'Promotions',
    path: '/promotions',
    icon: <Iconify icon="solar:check-circle-bold" />,
    info: (
      <Label color="success" variant="inverted">
        New
      </Label>
    ),
  },
  {
    title: 'VIP',
    path: '/vip',
    icon: <Iconify icon="solar:shield-keyhole-bold-duotone" />,
  },
  {
    title: 'Wallet',
    path: '/wallet',
    icon: <Iconify icon="solar:share-bold" />,
  },
  {
    title: 'Support',
    path: '/support',
    icon: <Iconify icon="solar:chat-round-dots-bold" />,
  },
];
