import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { useAuth } from 'src/auth/use-auth';
import { useSnackbar } from 'notistack';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const { loginUser, openAuthDialog, closeAuthDialog } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolveErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      return error.message;
    }
    return 'Unable to sign in';
  };

  const handleSignIn = useCallback(async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await loginUser({ email, password });
      enqueueSnackbar('Signed in successfully.', { variant: 'success' });
      router.push('/');
      closeAuthDialog();
    } catch (error) {
      const message = resolveErrorMessage(error);
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [closeAuthDialog, email, enqueueSnackbar, loginUser, password, router]);

  const renderForm = (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        handleSignIn();
      }}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      {errorMessage ? (
        <Alert severity="error" sx={{ width: 1, mb: 3 }}>
          {errorMessage}
        </Alert>
      ) : null}
      <TextField
        fullWidth
        name="email"
        label="Email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Sign in</Typography>
      </Box>
      {renderForm}
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OR
        </Typography>
      </Divider>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 1 }}>
        <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
          Forgot password?
        </Link>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Don’t have an account?
          <Link
            component="button"
            variant="subtitle2"
            sx={{ ml: 0.5 }}
            onClick={() => openAuthDialog('sign-up')}
          >
            Get started
          </Link>
        </Typography>
      </Box>
    </>
  );
}
