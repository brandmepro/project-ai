/**
 * Authentication utility functions
 */

/**
 * Store authentication tokens
 */
export function setAuthTokens(accessToken: string, refreshToken: string) {
  // Store in localStorage for client-side use
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  // Store in cookies for middleware
  document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`;
  document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict`;
}

/**
 * Clear authentication tokens (logout)
 */
export function clearAuthTokens() {
  // Clear localStorage
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
  return localStorage.getItem('accessToken');
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Logout user and redirect to login
 */
export async function logout(apiUrl?: string) {
  const token = getAccessToken();
  
  if (token && apiUrl) {
    try {
      // Call logout API
      await fetch(`${apiUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
  }
  
  // Clear tokens locally
  clearAuthTokens();
  
  // Redirect to login
  window.location.href = '/login';
}
