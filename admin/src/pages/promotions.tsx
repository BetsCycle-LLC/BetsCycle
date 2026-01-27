import { CONFIG } from 'src/config-global';

import { BetsCyclePromotionsView } from 'src/sections/betscycle/view';

export default function Page() {
  return (
    <>
      <title>{`Promotions - ${CONFIG.appName}`}</title>
      <meta name="description" content="Bonuses, tournaments, and loyalty campaigns." />

      <BetsCyclePromotionsView />
    </>
  );
}

