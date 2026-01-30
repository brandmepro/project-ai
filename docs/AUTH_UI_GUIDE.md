# Authentication UI Components Guide

Complete guide for using `@businesspro/auth-ui` across all Business Pro applications.

## Overview

The `@businesspro/auth-ui` package provides beautiful, mobile-responsive authentication components that work seamlessly on web, iOS, and Android (via Capacitor).

## Features

✅ **Mobile-First Design** - Optimized for touch and small screens
✅ **Desktop Beautiful** - Scales perfectly to larger displays  
✅ **Multi-Step Onboarding** - Smooth 3-step signup flow
✅ **Brand Consistent** - Matches Business Pro design system
✅ **Capacitor Ready** - Works in iOS/Android native apps
✅ **Reusable** - Use across multiple apps in the monorepo
✅ **Type Safe** - Full TypeScript support
✅ **Animated** - Smooth Framer Motion transitions

## Installation

The package is already part of the monorepo workspace. To use it in a new app:

```json
// package.json
{
  "dependencies": {
    "@businesspro/auth-ui": "workspace:*"
  }
}
```

Then run:
```bash
bun install
```

## Quick Start

### 1. Login Page

```tsx
'use client';

import { Login } from '@businesspro/auth-ui';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async ({ email, password }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    const { accessToken, refreshToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    router.push('/dashboard');
  };

  return (
    <Login
      onLogin={handleLogin}
      onSignupClick={() => router.push('/signup')}
    />
  );
}
```

### 2. Signup Page

```tsx
'use client';

import { Signup } from '@businesspro/auth-ui';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = async (data) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    const { accessToken, refreshToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    router.push('/dashboard');
  };

  return (
    <Signup
      onSignup={handleSignup}
      onLoginClick={() => router.push('/login')}
    />
  );
}
```

## Component API

### `<Login />` Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onLogin` | `(credentials: LoginCredentials) => Promise<void>` | ✅ | Login handler function |
| `onSignupClick` | `() => void` | ❌ | Navigate to signup page |
| `onForgotPassword` | `(email: string) => Promise<void>` | ❌ | Forgot password handler |
| `onSocialLogin` | `(provider: 'google' \| 'facebook') => Promise<void>` | ❌ | Social login handler |
| `loading` | `boolean` | ❌ | External loading state |

### `<Signup />` Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSignup` | `(data: SignupData) => Promise<void>` | ✅ | Signup handler function |
| `onLoginClick` | `() => void` | ❌ | Navigate to login page |
| `onSocialLogin` | `(provider: 'google' \| 'facebook') => Promise<void>` | ❌ | Social signup handler |
| `loading` | `boolean` | ❌ | External loading state |
| `businessTypes` | `Array<{ value: string; label: string }>` | ❌ | Custom business type options |

## TypeScript Types

```typescript
import type { 
  LoginCredentials, 
  SignupData,
  OnboardingData 
} from '@businesspro/auth-ui';

// Login credentials
interface LoginCredentials {
  email: string;
  password: string;
}

// Signup data (basic)
interface SignupData {
  email: string;
  password: string;
  name: string;
  businessType?: string;
}

// Full onboarding data (with all steps)
interface OnboardingData extends SignupData {
  businessName?: string;
  goals?: string[];
}
```

## Integration with Backend API

### API Endpoints Expected

The components work with standard REST auth endpoints:

**Login:** `POST /api/v1/auth/login`
```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

**Signup:** `POST /api/v1/auth/register`
```json
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Business Name",
  "businessType": "cafe"
}

// Response
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

## Error Handling

Handle errors in your callbacks:

```tsx
const handleLogin = async (credentials) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Show error notification
      notifications.show({
        title: 'Login failed',
        message: error.message,
        color: 'red',
      });
      
      throw new Error(error.message);
    }

    // Success handling...
  } catch (error) {
    // Re-throw to stop loading state
    throw error;
  }
};
```

## Mobile-Specific Features

### Capacitor Integration

The components work perfectly in Capacitor apps:

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.businesspro.app',
  appName: 'Business Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

### Safe Area Support

The components automatically handle safe areas on iOS/Android. No additional configuration needed!

### Responsive Breakpoints

- **Mobile:** `< 1024px` - Optimized for touch, vertical layout
- **Desktop:** `≥ 1024px` - Wider form, enhanced spacing

## Customization

### Custom Business Types

```tsx
const customBusinessTypes = [
  { value: 'bakery', label: '🥖 Bakery' },
  { value: 'pharmacy', label: '💊 Pharmacy' },
  { value: 'bookstore', label: '📚 Bookstore' },
];

<Signup
  onSignup={handleSignup}
  businessTypes={customBusinessTypes}
/>
```

### Custom Auth Layout

Use the `AuthLayout` component for custom auth pages:

```tsx
import { AuthLayout } from '@businesspro/auth-ui';

export function CustomAuthPage() {
  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your new password"
    >
      {/* Your custom form */}
    </AuthLayout>
  );
}
```

## Styling

The components use Business Pro's design tokens:

- **Colors:** Purple/violet gradient (`oklch(0.55 0.25 280)`)
- **Font:** Poppins (300, 400, 500, 600, 700)
- **Border Radius:** Large (`0.75rem`)
- **Animations:** Spring physics (stiffness: 400, damping: 17)

All styling is inherited from Mantine's theme and Tailwind config.

## Building for Production

```bash
# Build the auth-ui package
bun run build:auth-ui

# Build your app (includes auth-ui automatically)
bun run build
```

## Testing

### Manual Testing Checklist

- [ ] Desktop login form validation
- [ ] Desktop signup 3-step flow
- [ ] Mobile login (iOS Safari, Android Chrome)
- [ ] Mobile signup flow with touch interactions
- [ ] Password visibility toggle
- [ ] Social login buttons (if enabled)
- [ ] Forgot password link
- [ ] Navigation between login/signup
- [ ] Error messages display correctly
- [ ] Loading states work properly
- [ ] Capacitor app integration
- [ ] Landscape orientation (mobile)

## Troubleshooting

### Issue: Components not rendering

**Solution:** Ensure Mantine theme is set up in your app:

```tsx
// app/layout.tsx
import { MantineProvider } from '@mantine/core';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MantineProvider>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
```

### Issue: Styles not applying

**Solution:** Import Mantine CSS:

```tsx
// app/layout.tsx
import '@mantine/core/styles.css';
```

### Issue: Type errors

**Solution:** Build the auth-ui package first:

```bash
bun run build:auth-ui
```

## Examples

See the example implementations in `our-app`:
- Login: `/our-app/app/(auth)/login/page.tsx`
- Signup: `/our-app/app/(auth)/signup/page.tsx`

## Support

For issues or questions:
1. Check this guide
2. Review the example implementations
3. Check the package README: `packages/auth-ui/README.md`

---

**Built with ❤️ for Business Pro**
