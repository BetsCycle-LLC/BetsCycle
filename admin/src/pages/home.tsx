import { CONFIG } from 'src/config-global';

import { BetsCycleHomeView } from 'src/sections/betscycle/view';

export default function Page() {
  return (
    <>
      <title>{`Home - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="BetsCycle crypto gambling platform with Originals, Casino, and Sports."
      />
      <meta name="keywords" content="crypto gambling, casino, sportsbook, provably fair" />

      <BetsCycleHomeView />
    </>
  );
}

