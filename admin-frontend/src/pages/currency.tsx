import { CONFIG } from 'src/config-global';

import { CurrencyManagementView } from 'src/sections/currency/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Currency Management - ${CONFIG.appName}`}</title>

      <CurrencyManagementView />
    </>
  );
}

