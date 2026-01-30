'use client';

import { useRouter } from 'next/navigation';
import { Login } from '@businesspro/auth-ui';
import { notifications } from '@mantine/notifications';
import { setAuthTokens } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store tokens
      setAuthTokens(data.accessToken, data.refreshToken);

      notifications.show({
        title: 'Success!',
        message: 'Logged in successfully',
        color: 'green',
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to login',
        color: 'red',
      });
      throw error;
    }
  };

  const handleForgotPassword = async (email: string) => {
    if (!email) {
      notifications.show({
        title: 'Email required',
        message: 'Please enter your email first',
        color: 'yellow',
      });
      return;
    }

    // TODO: Implement forgot password API
    notifications.show({
      title: 'Password reset',
      message: 'Check your email for reset instructions',
      color: 'blue',
    });
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    // TODO: Implement social login
    notifications.show({
      title: 'Coming soon',
      message: `${provider} login will be available soon`,
      color: 'blue',
    });
  };

  return (
    <Login
      onLogin={handleLogin}
      onSignupClick={() => router.push('/signup')}
      onForgotPassword={handleForgotPassword}
      onSocialLogin={handleSocialLogin}
    />
  );
}
