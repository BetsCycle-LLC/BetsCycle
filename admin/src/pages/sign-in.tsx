import { Navigate } from 'react-router';

import { useAuth } from 'src/auth/use-auth';
import { SignInView } from 'src/sections/auth';
import { AuthLayout } from 'src/layouts/auth';

// ----------------------------------------------------------------------

export default function SignInPage() {
  const { user, isReady } = useAuth();

  if (isReady && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout>
      <SignInView />
    </AuthLayout>
  );
}

