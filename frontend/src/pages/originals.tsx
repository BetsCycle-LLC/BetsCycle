import { CONFIG } from 'src/config-global';

import { BetsCycleOriginalsView } from 'src/sections/betscycle/view';

export default function Page() {
  return (
    <>
      <title>{`Originals - ${CONFIG.appName}`}</title>
      <meta name="description" content="BetsCycle Originals games with provably fair RNG." />

      <BetsCycleOriginalsView />
    </>
  );
}

