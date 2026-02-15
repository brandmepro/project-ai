'use client';

import { useRouter } from 'next/navigation';
import { Login } from '@businesspro/auth-ui';
import { notifications } from '@mantine/notifications';
import { setAuthTokens } from '@/lib/auth';
import { useAuthControllerLogin, LoginDtoDTO, ApiError } from '@businesspro/api-client';

export default function LoginPage() {
  const router = useRouter();
  
  const loginMutation = useAuthControllerLogin({
    mutation: {
      onSuccess: (response: any) => {
        // Store tokens
        setAuthTokens(response.accessToken, response.refreshToken);
        
        notifications.show({
          title: 'Welcome back! 👋',
          message: 'Successfully logged in',
          color: 'green',
        });
        
        // Redirect to dashboard
        router.push('/dashboard');
      },
      onError: (error: unknown) => {
        const apiError = error as ApiError;
        notifications.show({
          title: 'Login Failed',
          message: apiError?.messages?.[0] || 'Invalid email or password',
          color: 'red',
        });
      },
    },
  });

  const handleLogin = async (credentials: LoginDtoDTO) => {
    loginMutation.mutate({ data: credentials });
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
    if (provider === 'google') {
      // Get API URL and construct OAuth endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
      window.location.href = `${apiUrl}/api/v1/auth/google`;
    } else {
      // Facebook not implemented yet
      notifications.show({
        title: 'Coming soon',
        message: `${provider} login will be available soon`,
        color: 'blue',
      });
    }
  };

  return (
    <Login
      onLogin={handleLogin}
      onSignupClick={() => router.push('/signup')}
      onForgotPassword={handleForgotPassword}
      onSocialLogin={handleSocialLogin}
      loading={loginMutation.isPending}
    />
  );
}
