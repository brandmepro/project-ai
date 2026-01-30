import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// --- Environment Variables for API URL ---
const API_BASE_URL =
  typeof window !== 'undefined' && (window as any).ENV?.VITE_API_URL
    ? (window as any).ENV.VITE_API_URL
    : process.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// --- Custom Error Class for API Errors ---
export class ApiError extends Error {
  constructor(
    public status: number,
    public data: any,
    public messages: string[],
  ) {
    super(messages?.[0] || 'An error occurred');
    this.name = 'ApiError';
  }
}

// --- Date Transformation Utilities ---
const isoDateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?(?:[-+]\d{2}:?\d{2}|Z)?$/;

function isIsoDateString(value: any): boolean {
  return value && typeof value === 'string' && isoDateFormat.test(value);
}

/**
 * Recursively transforms ISO date strings to Date objects
 * This ensures consistent date handling across the application
 */
export function transformDates<T>(body: T): T {
  if (body === null || body === undefined || typeof body !== 'object') {
    return body;
  }

  for (const key of Object.keys(body)) {
    // @ts-expect-error typing issue for any
    const value = body[key];
    if (isIsoDateString(value)) {
      (body as any)[key] = new Date(value);
    } else if (typeof value === 'object') {
      transformDates(value);
    }
  }

  return body;
}

// --- Request Queue for Idempotency ---
/**
 * Track in-flight requests to prevent duplicate API calls
 * Key: `${method}:${url}:${JSON.stringify(data)}`
 * Value: Promise of the ongoing request
 */
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Generate a unique key for request deduplication
 */
function getRequestKey(config: AxiosRequestConfig): string {
  const { method = 'get', url = '', data } = config;
  const dataKey = data ? JSON.stringify(data) : '';
  return `${method.toUpperCase()}:${url}:${dataKey}`;
}

/**
 * Apply interceptors to axios instance for auth, idempotency, and error handling
 */
const applyInterceptors = (instance: AxiosInstance) => {
  // --- Request Interceptor: Auth Token & Request Deduplication ---
  instance.interceptors.request.use(
    async config => {
      // Generate request key for deduplication
      const requestKey = getRequestKey(config);

      // Check if the same request is already in flight (idempotency check)
      if (pendingRequests.has(requestKey)) {
        // For idempotent operations (GET), return the existing promise
        const method = (config.method || 'get').toUpperCase();
        if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
          console.log(`[Idempotency] Reusing existing ${method} request:`, config.url);
          // Wait for the existing request instead of creating a new one
          const existingPromise = pendingRequests.get(requestKey);
          throw { isReusedRequest: true, promise: existingPromise };
        }
      }

      // Special handling for refresh endpoint
      if (config.url?.includes('/auth/refresh')) {
        // Get refresh token from auth storage
        const authData =
          typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('auth-storage') || '{}')
            : {};
        const refreshToken = authData?.state?.refreshToken;

        if (refreshToken) {
          config.headers.Authorization = `Bearer ${refreshToken}`;
        }
      } else {
        // Normal flow - use access token for all other endpoints
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      return config;
    },
    error => Promise.reject(error),
  );

  // --- Response Interceptor: Date Transformation & Error Handling ---
  instance.interceptors.response.use(
    response => {
      // Transform ISO date strings to Date objects
      response.data = transformDates(response.data);

      // Remove request from pending queue
      const requestKey = getRequestKey(response.config);
      pendingRequests.delete(requestKey);

      return response;
    },
    error => {
      // Handle reused requests (idempotency)
      if (error?.isReusedRequest) {
        return error.promise;
      }

      if (error instanceof AxiosError) {
        // Remove request from pending queue on error
        if (error.config) {
          const requestKey = getRequestKey(error.config);
          pendingRequests.delete(requestKey);
        }

        // Handle 401 Unauthorized - clear auth and optionally redirect
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('auth-storage');

            // Optional: Redirect to login page
            // Only redirect if not already on auth pages
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              window.location.href = '/login';
            }
          }
        }

        // Throw custom ApiError with structured error information
        throw new ApiError(
          error.response?.status || 500,
          error.response?.data,
          Array.isArray(error.response?.data?.message)
            ? error.response?.data?.message
            : [error.response?.data?.message || error.message],
        );
      }

      return Promise.reject(error);
    },
  );
};

/**
 * Create axios instance with base configuration
 */
const createApiInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000, // 30 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  applyInterceptors(instance);
  return instance;
};

// --- Export API Instance ---
export const API_INSTANCE = createApiInstance(API_BASE_URL);

// --- Generic Instance Logic (used by Orval-generated mutators) ---
const genericInstance = <T>(instance: AxiosInstance, config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  const requestKey = getRequestKey(config);

  // Create the promise for this request
  const promise = instance({
    ...config,
    cancelToken: source.token,
  })
    .then(({ data }) => {
      // Remove from pending requests on success
      pendingRequests.delete(requestKey);
      return data;
    })
    .catch(error => {
      // Remove from pending requests on error
      pendingRequests.delete(requestKey);
      throw error;
    });

  // Store in pending requests map for idempotency
  pendingRequests.set(requestKey, promise);

  // Add cancel method to the promise
  (promise as any).cancel = () => {
    source.cancel('Query was cancelled by user');
    pendingRequests.delete(requestKey);
  };

  return promise;
};

// --- Export Custom Mutator for Orval ---
/**
 * Custom axios instance mutator for Orval-generated API clients
 * This ensures all API calls go through our interceptors and idempotency logic
 */
export const customAxiosInstance = <T>(config: AxiosRequestConfig): Promise<T> =>
  genericInstance<T>(API_INSTANCE, config);

// --- Helper Functions ---
/**
 * Manually clear the pending requests queue
 * Useful for testing or when you need to force refresh
 */
export const clearPendingRequests = () => {
  pendingRequests.clear();
};

/**
 * Check if a request is currently pending
 */
export const isRequestPending = (config: AxiosRequestConfig): boolean => {
  const requestKey = getRequestKey(config);
  return pendingRequests.has(requestKey);
};

/**
 * Get count of pending requests
 */
export const getPendingRequestsCount = (): number => {
  return pendingRequests.size;
};
