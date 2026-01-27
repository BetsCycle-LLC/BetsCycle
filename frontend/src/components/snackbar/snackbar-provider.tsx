import type { PropsWithChildren } from 'react';

import { SnackbarProvider as NotistackProvider } from 'notistack';

import { CustomSnackbar } from './custom-snackbar';

export function SnackbarProvider({ children }: PropsWithChildren) {
  return (
    <NotistackProvider
      maxSnack={4}
      autoHideDuration={4000}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      Components={{
        success: CustomSnackbar,
        error: CustomSnackbar,
        warning: CustomSnackbar,
        info: CustomSnackbar,
      }}
    >
      {children}
    </NotistackProvider>
  );
}

