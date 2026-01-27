import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

import { SignInView, SignUpView } from 'src/sections/auth';

import { useAuth } from './use-auth';

export function AuthModal() {
  const { authDialog, closeAuthDialog } = useAuth();

  return (
    <Dialog
      open={authDialog.open}
      onClose={closeAuthDialog}
      fullWidth
      maxWidth="sm"
    >
      <DialogContent sx={{ py: 5 }}>
        {authDialog.mode === 'sign-in' ? <SignInView /> : <SignUpView />}
      </DialogContent>
    </Dialog>
  );
}

