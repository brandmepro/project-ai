# @businesspro/auth-ui

Beautiful, mobile-responsive authentication UI components for Business Pro apps.

## Features

- 🎨 Beautiful, modern design matching Business Pro theme
- 📱 Mobile-first, Capacitor-ready for iOS/Android
- 💻 Desktop-optimized with smooth animations
- 🔄 Multi-step onboarding flow
- 🎯 Reusable across multiple apps
- ✨ Built with Mantine UI + Framer Motion

## Installation

```bash
bun add @businesspro/auth-ui
```

## Peer Dependencies

Make sure you have these installed:

```bash
bun add react react-dom @mantine/core @mantine/hooks @mantine/form framer-motion @tabler/icons-react
```

## Usage

### Login Component

```tsx
import { Login } from '@businesspro/auth-ui';

function LoginPage() {
  const handleLogin = async (credentials) => {
    // Call your API
    await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  };

  return (
    <Login
      onLogin={handleLogin}
      onSignupClick={() => router.push('/signup')}
      onForgotPassword={(email) => console.log('Forgot password:', email)}
      onSocialLogin={(provider) => console.log('Social login:', provider)}
    />
  );
}
```

### Signup Component

```tsx
import { Signup } from '@businesspro/auth-ui';

function SignupPage() {
  const handleSignup = async (data) => {
    // Call your API
    await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  return (
    <Signup
      onSignup={handleSignup}
      onLoginClick={() => router.push('/login')}
      onSocialLogin={(provider) => console.log('Social signup:', provider)}
      businessTypes={[
        { value: 'cafe', label: '☕ Cafe' },
        { value: 'restaurant', label: '🍽️ Restaurant' },
        // ... more types
      ]}
    />
  );
}
```

## Components

### `<Login />`

Full-featured login form with email/password and social login options.

**Props:**
- `onLogin: (credentials: LoginCredentials) => Promise<void>` - Login handler
- `onSignupClick?: () => void` - Navigate to signup
- `onForgotPassword?: (email: string) => Promise<void>` - Forgot password handler
- `onSocialLogin?: (provider: 'google' | 'facebook') => Promise<void>` - Social login handler
- `loading?: boolean` - Show loading state

### `<Signup />`

Multi-step onboarding flow with account creation, business info, and goal selection.

**Props:**
- `onSignup: (data: SignupData) => Promise<void>` - Signup handler
- `onLoginClick?: () => void` - Navigate to login
- `onSocialLogin?: (provider: 'google' | 'facebook') => Promise<void>` - Social signup handler
- `loading?: boolean` - Show loading state
- `businessTypes?: Array<{ value: string; label: string }>` - Custom business types

### `<AuthLayout />`

Reusable layout wrapper for custom auth pages.

**Props:**
- `children: React.ReactNode` - Page content
- `title: string` - Page title
- `subtitle?: string` - Page subtitle
- `showLogo?: boolean` - Show Business Pro logo

## Styling

The components use Business Pro's design system:
- Purple/violet gradient theme (OKLCH colors)
- Poppins font family
- Large border radius (xl)
- Smooth animations with Framer Motion
- Mobile-optimized touch targets

## Mobile Support

These components are designed for Capacitor apps:
- Uses `100dvh` for mobile viewports
- Touch-optimized tap targets
- Responsive padding and spacing
- Works perfectly on iOS and Android

## License

MIT
