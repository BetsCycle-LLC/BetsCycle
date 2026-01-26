import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function ThemeModeToggle() {
  const { mode, setMode } = useColorScheme();
  const isDark = mode === 'dark';

  const handleToggle = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <Switch
        size="small"
        checked={isDark}
        onChange={handleToggle}
        inputProps={{ 'aria-label': 'Toggle light/dark theme' }}
      />
    </Tooltip>
  );
}

