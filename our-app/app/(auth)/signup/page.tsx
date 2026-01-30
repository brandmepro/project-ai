'use client';

import { useRouter } from 'next/navigation';
import { Signup } from '@businesspro/auth-ui';
import { notifications } from '@mantine/notifications';
import { setAuthTokens } from '@/lib/auth';

const BUSINESS_TYPES = [
  { value: 'cafe', label: '☕ Cafe' },
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'salon', label: '💇 Salon & Spa' },
  { value: 'gym', label: '💪 Gym & Fitness' },
  { value: 'clinic', label: '🏥 Clinic' },
  { value: 'boutique', label: '👗 Boutique' },
  { value: 'kirana', label: '🛒 Retail Store' },
  { value: 'tea-shop', label: '🍵 Tea Shop' },
];

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = async (data: {
    email: string;
    password: string;
    name: string;
    businessType?: string;
    businessName?: string;
    goals?: string[];
  }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.businessName || data.name,
          businessType: data.businessType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const result = await response.json();

      // Store tokens
      setAuthTokens(result.accessToken, result.refreshToken);

      notifications.show({
        title: 'Welcome! 🎉',
        message: 'Your account has been created successfully',
        color: 'green',
      });

      // Redirect to onboarding or dashboard
      router.push('/dashboard');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create account',
        color: 'red',
      });
      throw error;
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook') => {
    // TODO: Implement social signup
    notifications.show({
      title: 'Coming soon',
      message: `Sign up with ${provider} will be available soon`,
      color: 'blue',
    });
  };

  return (
    <Signup
      onSignup={handleSignup}
      onLoginClick={() => router.push('/login')}
      onSocialLogin={handleSocialSignup}
      businessTypes={BUSINESS_TYPES}
    />
  );
}
