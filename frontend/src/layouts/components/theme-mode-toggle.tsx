import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useThemeStore } from 'src/store/theme-store';

// ----------------------------------------------------------------------

export function ThemeModeToggle() {
  const { mode, setMode } = useColorScheme();
  const { setThemeMode } = useThemeStore();
  const isDark = mode === 'dark';

  const handleToggle = () => {
    const nextMode = isDark ? 'light' : 'dark';
    setMode(nextMode);
    setThemeMode(nextMode);
  };

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        size="small"
        onClick={handleToggle}
        aria-label="Toggle light/dark theme"
        color="inherit"
      >
        <Iconify
          icon={isDark ? 'custom:sun-bold' : 'custom:moon-bold'}
          width={18}
          sx={{
            color: isDark ? 'warning.main' : 'text.primary',
          }}
        />
      </IconButton>
    </Tooltip>
  );
}

