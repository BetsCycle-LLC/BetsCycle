import { CONFIG } from 'src/config-global';

import { BetsCycleLoyaltyClubView } from 'src/sections/betscycle/view';

export default function Page() {
  return (
    <>
      <title>{`Loyalty Club - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="Track loyalty XP, tier progress, and rewards across Originals, Casino, and Sports."
      />

      <BetsCycleLoyaltyClubView />
    </>
  );
}

