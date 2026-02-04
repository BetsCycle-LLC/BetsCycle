import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ThemeModeToggle() {
  const { mode, setMode } = useColorScheme();
  const isDark = mode === 'dark';

  const handleToggle = () => {
    setMode(isDark ? 'light' : 'dark');
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

