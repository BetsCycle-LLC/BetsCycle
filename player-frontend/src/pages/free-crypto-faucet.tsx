import { CONFIG } from 'src/config-global';

import { BetsCycleFreeCryptoFaucetView } from 'src/sections/betscycle/view';

export default function Page() {
  return (
    <>
      <title>{`Free Crypto Faucet - ${CONFIG.appName}`}</title>
      <meta name="description" content="Claim free crypto faucet rewards based on your loyalty tier." />

      <BetsCycleFreeCryptoFaucetView />
    </>
  );
}


