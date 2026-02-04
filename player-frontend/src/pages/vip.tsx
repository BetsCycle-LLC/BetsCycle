import { CONFIG } from 'src/config-global';

import { BetsCycleVipView } from 'src/sections/betscycle/view';

export default function Page() {
  return (
    <>
      <title>{`VIP - ${CONFIG.appName}`}</title>
      <meta name="description" content="Tiered VIP rewards and personalized benefits." />

      <BetsCycleVipView />
    </>
  );
}

