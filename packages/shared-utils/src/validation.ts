/**
 * Shared validation utilities for BusinessPro
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email address' };
  }

  return { isValid: true };
}

/**
 * Password validation with strength requirements
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Password must include lowercase letter' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Password must include uppercase letter' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must include a number' };
  }

  return { isValid: true };
}

/**
 * Name validation (supports both personal and business names)
 */
export function validateName(name: string, fieldName = 'Name'): ValidationResult {
  if (!name || !name.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }

  if (name.trim().length > 100) {
    return { isValid: false, error: `${fieldName} must be less than 100 characters` };
  }

  return { isValid: true };
}

/**
 * Business type validation
 */
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

export type BusinessType = (typeof VALID_BUSINESS_TYPES)[number];

export function validateBusinessType(type: string): ValidationResult {
  if (!type) {
    return { isValid: false, error: 'Business type is required' };
  }

  if (!VALID_BUSINESS_TYPES.includes(type as BusinessType)) {
    return { isValid: false, error: 'Invalid business type' };
  }

  return { isValid: true };
}

/**
 * Content goals validation
 */
export const VALID_CONTENT_GOALS = [
  'awareness',
  'engagement',
  'promotion',
  'festival',
] as const;

export type ContentGoal = (typeof VALID_CONTENT_GOALS)[number];

export function validateGoals(goals: string[]): ValidationResult {
  if (!Array.isArray(goals)) {
    return { isValid: false, error: 'Goals must be an array' };
  }

  // Goals are optional, so empty array is valid
  if (goals.length === 0) {
    return { isValid: true };
  }

  const invalidGoals = goals.filter(goal => !VALID_CONTENT_GOALS.includes(goal as ContentGoal));
  
  if (invalidGoals.length > 0) {
    return { 
      isValid: false, 
      error: `Invalid goals: ${invalidGoals.join(', ')}` 
    };
  }

  return { isValid: true };
}

/**
 * Complete signup data validation
 */
export interface SignupData {
  email: string;
  password: string;
  name: string;
  businessName: string;
  businessType: string;
  goals?: string[];
}

export function validateSignupData(data: Partial<SignupData>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Email
  const emailResult = validateEmail(data.email || '');
  if (!emailResult.isValid) {
    errors.email = emailResult.error!;
  }

  // Password
  const passwordResult = validatePassword(data.password || '');
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error!;
  }

  // Name
  const nameResult = validateName(data.name || '', 'Name');
  if (!nameResult.isValid) {
    errors.name = nameResult.error!;
  }

  // Business Name
  const businessNameResult = validateName(data.businessName || '', 'Business name');
  if (!businessNameResult.isValid) {
    errors.businessName = businessNameResult.error!;
  }

  // Business Type
  const businessTypeResult = validateBusinessType(data.businessType || '');
  if (!businessTypeResult.isValid) {
    errors.businessType = businessTypeResult.error!;
  }

  // Goals (optional)
  if (data.goals) {
    const goalsResult = validateGoals(data.goals);
    if (!goalsResult.isValid) {
      errors.goals = goalsResult.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
