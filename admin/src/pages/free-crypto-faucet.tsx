import { CONFIG } from 'src/config-global';

import { FaucetManagementView } from 'src/sections/faucet/view';

export default function Page() {
  return (
    <>
      <title>{`Free Crypto Faucet - ${CONFIG.appName}`}</title>
      <meta name="description" content="Configure free crypto faucet rewards and intervals." />

      <FaucetManagementView />
    </>
  );
}


