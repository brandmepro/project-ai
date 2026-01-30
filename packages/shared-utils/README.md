# @businesspro/shared-utils

Shared validation utilities and constants for BusinessPro.

## Features

- ✅ Email validation
- ✅ Password strength validation
- ✅ Name validation (personal and business)
- ✅ Business type validation
- ✅ Content goals validation
- ✅ Complete signup data validation

## Usage

```typescript
import { validateEmail, validatePassword, validateSignupData } from '@businesspro/shared-utils';

// Email validation
const emailResult = validateEmail('user@example.com');
if (!emailResult.isValid) {
  console.error(emailResult.error);
}

// Password validation (requires uppercase, lowercase, number, min 8 chars)
const passwordResult = validatePassword('SecurePass123!');
if (!passwordResult.isValid) {
  console.error(passwordResult.error);
}

// Complete signup validation
const signupResult = validateSignupData({
  email: 'user@example.com',
  password: 'SecurePass123!',
  name: 'John Doe',
  businessName: 'My Cafe',
  businessType: 'cafe',
  goals: ['awareness', 'engagement']
});

if (!signupResult.isValid) {
  console.error(signupResult.errors);
}
```

## Constants

### Business Types
```typescript
export const VALID_BUSINESS_TYPES = [
  'cafe',
  'restaurant',
  'salon',
  'gym',
  'clinic',
  'boutique',
  'kirana',
  'tea-shop',
  'retail',
  'other',
] as const;
```

### Content Goals
```typescript
export const VALID_CONTENT_GOALS = [
  'awareness',
  'engagement',
  'promotion',
  'festival',
] as const;
```
