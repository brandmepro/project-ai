'use client';

import { useRouter } from 'next/navigation';
import { Signup } from '@businesspro/auth-ui';
import { notifications } from '@mantine/notifications';
import { setAuthTokens } from '@/lib/auth';
import { 
  useAuthControllerRegister, 
  RegisterDtoDTO, 
  RegisterDtoDTOBusinessType,
  ApiError 
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
        // Store tokens
        setAuthTokens(response.accessToken, response.refreshToken);
        
        notifications.show({
          title: 'Welcome to BusinessPro! 🎉',
          message: 'Your account has been created successfully',
          color: 'green',
        });
        
        // Redirect to dashboard
        router.push('/dashboard');
      },
      onError: (error: unknown) => {
        const apiError = error as ApiError;
        const errorMessage = apiError?.messages?.[0] || 'Failed to create account';
        
        notifications.show({
          title: 'Signup Failed',
          message: errorMessage,
          color: 'red',
        });
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

    registerMutation.mutate({ data: signupData });
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
      loading={registerMutation.isPending}
    />
  );
}
