'use client';

import { useRouter } from 'next/navigation';
import { Signup } from '@businesspro/auth-ui';
import { notifications } from '@mantine/notifications';
import { setAuthTokens } from '@/lib/auth';
import { 
  useAuthControllerRegister, 
  RegisterDtoDTO, 
  RegisterDtoDTOBusinessType,
} from '@businesspro/api-client';

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
  
  const registerMutation = useAuthControllerRegister({
    mutation: {
      onSuccess: (response: any) => {
        setAuthTokens(response.accessToken, response.refreshToken);
        router.push('/dashboard');
      },
    },
  });

  const handleSignup = async (data: {
    email: string;
    password: string;
    name: string;
    businessType?: string;
    businessName?: string;
    goals?: string[];
  }) => {
    const signupData: RegisterDtoDTO = {
      email: data.email,
      password: data.password,
      name: data.name,
      businessName: data.businessName,
      businessType: data.businessType as RegisterDtoDTOBusinessType,
      goals: data.goals,
    };

    // mutateAsync throws on API error — this lets the Signup component's
    // try/catch block catch it and stay on the current step instead of
    // advancing to the success screen prematurely.
    await registerMutation.mutateAsync({ data: signupData });
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook') => {
    if (provider === 'google') {
      // Get API URL and construct OAuth endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
      window.location.href = `${apiUrl}/api/v1/auth/google`;
    } else {
      // Facebook not implemented yet
      notifications.show({
        title: 'Coming soon',
        message: `Sign up with ${provider} will be available soon`,
        color: 'blue',
      });
    }
  };

  return (
    <Signup
      onSignup={handleSignup}
      onLoginClick={() => router.push('/login')}
      onSocialLogin={handleSocialSignup}
      businessTypes={BUSINESS_TYPES}
      loading={registerMutation.isPending}
    />
  );
}
