/**
 * Authentication utility functions
 */

/**
 * Store authentication tokens
 */
export function setAuthTokens(accessToken: string, refreshToken: string) {
  // Store in localStorage for axios interceptor
  localStorage.setItem('auth-token', accessToken);
  localStorage.setItem('auth-storage', JSON.stringify({
    state: {
      refreshToken,
    }
  }));
  
  // Also store in cookies for middleware
  document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`;
  document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict`;
}

/**
 * Clear authentication tokens (logout)
 */
export function clearAuthTokens() {
  // Clear localStorage
  localStorage.removeItem('auth-token');
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Clear cookies
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth-token');
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  const authData = localStorage.getItem('auth-storage');
  if (!authData) return null;
  try {
    const parsed = JSON.parse(authData);
    return parsed?.state?.refreshToken || null;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
