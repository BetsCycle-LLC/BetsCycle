import { CONFIG } from 'src/config-global';

import { BetsCycleSportsView } from 'src/sections/betscycle/view';

export default function Page() {
  return (
    <>
      <title>{`Sports - ${CONFIG.appName}`}</title>
      <meta name="description" content="Live sportsbook experience with real-time odds." />

      <BetsCycleSportsView />
    </>
  );
}

