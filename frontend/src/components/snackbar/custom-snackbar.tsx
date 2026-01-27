import type { SnackbarProps } from '@mui/material/Snackbar';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';

import { Iconify } from 'src/components/iconify';
import type { IconifyName } from 'src/components/iconify/register-icons';

type Severity = 'success' | 'error' | 'warning' | 'info';

const severityIcon: Record<Severity, IconifyName> = {
  success: 'solar:check-circle-bold',
  error: 'solar:trash-bin-trash-bold',
  warning: 'solar:clock-circle-outline',
  info: 'solar:chat-round-dots-bold',
};

export type CustomSnackbarProps = Omit<SnackbarProps, 'message' | 'children'> & {
  message: string;
  severity?: Severity;
};

export function CustomSnackbar({
  message,
  severity = 'info',
  onClose,
  ...other
}: CustomSnackbarProps) {
  return (
    <Snackbar onClose={onClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} {...other}>
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          minWidth: 320,
          maxWidth: 420,
          borderRadius: 2,
          color: theme.vars.palette.text.primary,
          bgcolor: theme.vars.palette.background.paper,
          border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
          boxShadow: theme.vars.shadows[8],
        })}
      >
        <Box
          sx={(theme) => ({
            width: 40,
            height: 40,
            padding: 1.375,
            borderRadius: 1.5,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: varAlpha(theme.vars.palette[severity].mainChannel, 0.16),
            color: theme.vars.palette[severity].main,
          })}
        >
          <Iconify width={18} icon={severityIcon[severity]} />
        </Box>
        <Typography variant="subtitle2" sx={{ flexGrow: 1, pr: 0.5 }}>
          {message}
        </Typography>
        <IconButton size="small" color="inherit" onClick={(event) => onClose?.(event, 'clickaway')}>
          <Iconify width={18} icon="mingcute:close-line" />
        </IconButton>
      </Box>
    </Snackbar>
  );
}

