import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { Iconify } from 'src/components/iconify';
import { SignInView, SignUpView } from 'src/sections/auth';

import { useAuth } from './use-auth';

export function AuthModal() {
  const { authDialog, closeAuthDialog } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestClose = () => {
    if (authDialog.mode === 'sign-up') {
      setConfirmOpen(true);
      return;
    }
    closeAuthDialog();
  };

  return (
    <Dialog
      open={authDialog.open}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') {
          return;
        }
        requestClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogContent sx={{ py: 5, position: 'relative' }}>
        <IconButton
          onClick={requestClose}
          sx={{ position: 'absolute', top: 12, right: 12 }}
          aria-label="Close auth dialog"
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>
        {authDialog.mode === 'sign-in' ? <SignInView /> : <SignUpView />}
      </DialogContent>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="auth-confirm-title"
      >
        <DialogTitle id="auth-confirm-title">Leave sign up?</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Your registration progress will be lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setConfirmOpen(false)}>
            Stay
          </Button>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => {
              setConfirmOpen(false);
              closeAuthDialog();
            }}
          >
            Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

