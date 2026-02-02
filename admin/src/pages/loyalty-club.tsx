import { CONFIG } from 'src/config-global';

import { LoyaltyClubManagementView } from 'src/sections/loyalty-club/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Loyalty Club Management - ${CONFIG.appName}`}</title>

      <LoyaltyClubManagementView />
    </>
  );
}

