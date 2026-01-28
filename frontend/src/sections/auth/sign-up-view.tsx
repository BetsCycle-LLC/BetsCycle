import { useRef, useState, useCallback } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MuiTelInput } from 'mui-tel-input';

import { useRouter } from 'src/routes/hooks';

import { CountrySelect, type CountryOption } from 'src/components/country-select';
import { Iconify } from 'src/components/iconify';
import { useAuth } from 'src/auth/use-auth';
import { updateProfile, verifyEmail } from 'src/services/auth-api';
import { Divider } from '@mui/material';
import { useSnackbar } from 'notistack';

export function SignUpView() {
  const router = useRouter();
  const { registerUser, loginUser, openAuthDialog, closeAuthDialog } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [profileStep, setProfileStep] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Dayjs | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState<CountryOption | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleSignUp = useCallback(async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    setVerificationMessage('');
    setVerificationPending(false);
    setProfileStep(false);

    try {
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      await registerUser({ username, email, password });
      setVerificationPending(true);
      setVerificationMessage('We sent a 6-digit verification code to your email.');
      enqueueSnackbar('Account created successfully. Check your email for the verification code.', {
        variant: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create account';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmPassword, email, enqueueSnackbar, password, registerUser, router, username]);

  const handleVerifyEmail = useCallback(async () => {
    setErrorMessage('');
    setIsVerifying(true);

    try {
      await verifyEmail({ email, code: verificationCode });
      enqueueSnackbar('Email verified successfully.', { variant: 'success' });
      setVerificationPending(false);
      setProfileStep(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to verify email';
      setErrorMessage(message);
    } finally {
      setIsVerifying(false);
    }
  }, [email, enqueueSnackbar, verificationCode]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setAvatarPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFinishProfile = useCallback(async () => {
    setErrorMessage('');
    setIsFinishing(true);

    try {
      if (!firstName || !lastName || !dateOfBirth || !country) {
        setErrorMessage('Please complete all required profile fields.');
        return;
      }

      const auth = await loginUser({ email, password });

      await updateProfile(auth.token, {
        avatar: avatarPreview || undefined,
        personalInfo: {
          firstName,
          lastName,
          dateOfBirth: dateOfBirth ? dayjs(dateOfBirth).toDate().toISOString() : undefined,
          phoneNumber: phoneNumber || undefined,
          country: country?.label,
        },
      });

      enqueueSnackbar('Profile updated successfully.', { variant: 'success' });
      router.push('/');
      closeAuthDialog();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to finish profile';
      setErrorMessage(message);
    } finally {
      setIsFinishing(false);
    }
  }, [
    avatarPreview,
    closeAuthDialog,
    country,
    dateOfBirth,
    email,
    firstName,
    lastName,
    loginUser,
    password,
    phoneNumber,
    router,
  ]);

  const otpValues = Array.from({ length: 6 }, (_, index) => verificationCode[index] ?? '');

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpValues];
    next[index] = digit;
    const nextCode = next.join('');
    setVerificationCode(nextCode);

    if (digit && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>,
  ) => {
    if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) {
      return;
    }
    setVerificationCode(pasted);
    const lastIndex = Math.min(pasted.length, 6) - 1;
    if (lastIndex >= 0) {
      otpRefs.current[lastIndex]?.focus();
    }
    event.preventDefault();
  };

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
        {!profileStep ? (
          <Stack spacing={3} sx={{ width: 1 }}>
            <TextField
              fullWidth
              name="username"
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              disabled={verificationPending}
            />
            <TextField
              fullWidth
              name="email"
              label="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              disabled={verificationPending}
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
              disabled={verificationPending}
            />
            <TextField
              fullWidth
              name="confirmPassword"
              label="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type={showConfirmPassword ? 'text' : 'password'}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        <Iconify
                          icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              disabled={verificationPending}
              error={!!confirmPassword && confirmPassword !== password}
              helperText={
                confirmPassword && confirmPassword !== password ? 'Passwords do not match.' : ' '
              }
            />
            <Button
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              disabled={isSubmitting || verificationPending}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </Stack>
        ) : null}
        {verificationMessage && !profileStep ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 3 }}>
            {verificationMessage}
          </Typography>
        ) : null}
        {verificationPending && !profileStep ? (
          <Stack spacing={2} sx={{ width: 1, mt: 2 }} onPaste={handleOtpPaste}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1.5 }}>
              {otpValues.map((value, index) => (
                <TextField
                  key={`otp-${index}`}
                  value={value}
                  inputRef={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 1,
                    style: { textAlign: 'center', fontSize: 18 },
                  }}
                />
              ))}
            </Box>
            <Button
              fullWidth
              size="large"
              type="button"
              color="inherit"
              variant="outlined"
              disabled={isVerifying || verificationCode.length !== 6}
              onClick={handleVerifyEmail}
            >
              {isVerifying ? 'Verifying...' : 'Verify email'}
            </Button>
          </Stack>
        ) : null}
        {profileStep ? (
          <Stack spacing={3} sx={{ width: 1, mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={avatarPreview} sx={{ width: 64, height: 64 }} />
              <Button component="label" variant="outlined" color="inherit">
                Upload avatar
                <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />
              </Button>
            </Box>
            <Box
              sx={{
                width: 1,
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              }}
            >
              <TextField
                fullWidth
                name="firstName"
                label="First name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
              <TextField
                fullWidth
                name="lastName"
                label="Last name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </Box>
            <Box
              sx={{
                width: 1,
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date of birth"
                  value={dateOfBirth}
                  onChange={(value: Dayjs | null) => setDateOfBirth(value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      name: 'dateOfBirth',
                    },
                  }}
                />
              </LocalizationProvider>
              <MuiTelInput
                fullWidth
                name="phoneNumber"
                label="Phone number"
                value={phoneNumber}
                onChange={setPhoneNumber}
              />
            </Box>
            <CountrySelect
              value={country}
              onChange={setCountry}
              slotProps={{
                paper: {
                  sx: (theme) => ({
                    boxShadow: theme.vars.shadows[16],
                  }),
                },
              }}
            />
            <Button
              fullWidth
              size="large"
              type="button"
              variant="contained"
              disabled={isFinishing}
              onClick={handleFinishProfile}
            >
              {isFinishing ? 'Finishing...' : 'Finish'}
            </Button>
          </Stack>
        ) : null}
      </Box>

      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OR
        </Typography>
      </Divider>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Already have an account?
          <Link
            component="button"
            variant="subtitle2"
            sx={{ ml: 0.5 }}
            onClick={() => openAuthDialog('sign-in')}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </>
  );
}

