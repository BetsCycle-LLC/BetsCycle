import type { Theme } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

export function layoutSectionVars(theme: Theme) {
  const isDark = theme.palette.mode === 'dark';

  return {
    '--layout-nav-zIndex': theme.zIndex.drawer + 1,
    '--layout-nav-mobile-width': '288px',
    '--layout-header-blur': '8px',
    '--layout-header-zIndex': theme.zIndex.appBar + 1,
    '--layout-header-mobile-height': '64px',
    '--layout-header-desktop-height': '72px',
    '--layout-nav-mini-width': '88px',
    '--layout-nav-horizontal-height': '64px',
    '--layout-nav-bg': theme.vars.palette.background.default,
    '--layout-nav-horizontal-bg': varAlpha(
      theme.vars.palette.background.defaultChannel,
      isDark ? 0.96 : 0.8
    ),
    '--layout-nav-border-color': varAlpha(
      theme.vars.palette.grey['500Channel'],
      isDark ? 0.08 : 0.12
    ),
    '--layout-nav-text-primary-color': theme.vars.palette.text.primary,
    '--layout-nav-text-secondary-color': theme.vars.palette.text.secondary,
    '--layout-nav-text-disabled-color': theme.vars.palette.text.disabled,
  };
}
