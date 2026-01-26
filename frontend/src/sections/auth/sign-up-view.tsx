import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { useAuth } from 'src/auth/use-auth';

export function SignUpView() {
  const router = useRouter();
  const { registerUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = useCallback(async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await registerUser({ username, email, password });
      router.push('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create account';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, registerUser, router, username]);

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
        <Typography variant="h5">Create account</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Already have an account?
          <Link component={RouterLink} to="/sign-in" variant="subtitle2" sx={{ ml: 0.5 }}>
            Sign in
          </Link>
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSignUp();
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
          name="username"
          label="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          sx={{ mb: 3 }}
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />
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
          color="inherit"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </Box>
    </>
  );
}

