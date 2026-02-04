import { CONFIG } from 'src/config-global';

import { BetsCycleCasinoView } from 'src/sections/betscycle/view';

export default function Page() {
  return (
    <>
      <title>{`Casino - ${CONFIG.appName}`}</title>
      <meta name="description" content="Casino lobby powered by third-party integrations." />

      <BetsCycleCasinoView />
    </>
  );
}

