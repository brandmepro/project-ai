export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  businessType?: string;
}

export interface AuthCallbacks {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onSignup: (data: SignupData) => Promise<void>;
  onForgotPassword?: (email: string) => Promise<void>;
  onSocialLogin?: (provider: 'google' | 'facebook') => Promise<void>;
}

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export interface LoginProps extends Pick<AuthCallbacks, 'onLogin' | 'onForgotPassword' | 'onSocialLogin'> {
  onSignupClick?: () => void;
  loading?: boolean;
}

export interface SignupProps extends Pick<AuthCallbacks, 'onSignup' | 'onSocialLogin'> {
  onLoginClick?: () => void;
  loading?: boolean;
  businessTypes?: Array<{ value: string; label: string }>;
}

export type OnboardingStep = 'account' | 'personal' | 'business' | 'goals' | 'welcome';

export interface OnboardingData {
  email: string;
  password: string;
  name: string;
  businessType?: string;
  businessName?: string;
  goals?: string[];
}
