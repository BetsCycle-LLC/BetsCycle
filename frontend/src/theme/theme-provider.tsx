import type { ThemeProviderProps as MuiThemeProviderProps } from '@mui/material/styles';

import { useEffect } from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as ThemeVarsProvider, useColorScheme } from '@mui/material/styles';

import { createTheme } from './create-theme';
import { useThemeStore } from 'src/store/theme-store';

import type {} from './extend-theme-types';
import type { ThemeOptions } from './types';

// ----------------------------------------------------------------------

export type ThemeProviderProps = Partial<MuiThemeProviderProps> & {
  themeOverrides?: ThemeOptions;
};

function ThemeModeSync() {
  const { mode } = useColorScheme();
  const { setThemeMode } = useThemeStore();

  useEffect(() => {
    if (mode === 'light' || mode === 'dark') {
      setThemeMode(mode);
    }
  }, [mode, setThemeMode]);

  return null;
}

export function ThemeProvider({ themeOverrides, children, ...other }: ThemeProviderProps) {
  const theme = createTheme({
    themeOverrides,
  });

  return (
    <ThemeVarsProvider
      disableTransitionOnChange
      theme={theme}
      defaultMode="dark"
      modeStorageKey="betcycle-mode"
      {...other}
    >
      <CssBaseline />
      <ThemeModeSync />
      {children}
    </ThemeVarsProvider>
  );
}
