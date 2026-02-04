import { CONFIG } from 'src/config-global';

import { BetsCycleWalletView } from 'src/sections/betscycle/view';

export default function Page() {
  return (
    <>
      <title>{`Wallet - ${CONFIG.appName}`}</title>
      <meta name="description" content="Multi-coin wallet and payout automation." />

      <BetsCycleWalletView />
    </>
  );
}

