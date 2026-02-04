import { CONFIG } from 'src/config-global';

import { BetsCycleSupportView } from 'src/sections/betscycle/view';

export default function Page() {
  return (
    <>
      <title>{`Support - ${CONFIG.appName}`}</title>
      <meta name="description" content="Player support, help center, and responsible gaming." />

      <BetsCycleSupportView />
    </>
  );
}

