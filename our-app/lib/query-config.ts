/**
 * React Query Configuration Presets
 * 
 * Use these presets to optimize query behavior based on data type.
 * Apply them using the `...queryOptions` spread in your query hooks.
 * 
 * Example:
 * ```ts
 * const { data } = useQuery({
 *   queryKey: ['user'],
 *   queryFn: fetchUser,
 *   ...QUERY_CONFIG.userProfile,
 * })
 * ```
 */

import { UseQueryOptions } from '@tanstack/react-query'

export const QUERY_CONFIG = {
  /**
   * User Profile, Business Info
   * - Changes infrequently
   * - Critical data that should be cached
   * - Fresh for 2 minutes
   */
  userProfile: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  },

  /**
   * Settings, Preferences, Notifications
   * - Changes occasionally
   * - Should stay fresh for reasonable duration
   * - Fresh for 1 minute
   */
  settings: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,    // 5 minutes
  },

  /**
   * Platform Connections
   * - Changes rarely
   * - Can be cached aggressively
   * - Fresh for 5 minutes
   */
  platformConnections: {
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 15 * 60 * 1000,    // 15 minutes
  },

  /**
   * Content List, Calendar Events
   * - Changes frequently
   * - Should refetch more often
   * - Fresh for 30 seconds
   */
  contentList: {
    staleTime: 30 * 1000,     // 30 seconds
    gcTime: 3 * 60 * 1000,    // 3 minutes
  },

  /**
   * Analytics, Stats, Insights
   * - Changes periodically
   * - Doesn't need real-time accuracy
   * - Fresh for 3 minutes
   */
  analytics: {
    staleTime: 3 * 60 * 1000,  // 3 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
  },

  /**
   * Real-time Data (if needed)
   * - Needs frequent updates
   * - Short cache duration
   * - Fresh for 10 seconds
   */
  realtime: {
    staleTime: 10 * 1000,     // 10 seconds
    gcTime: 1 * 60 * 1000,    // 1 minute
    refetchInterval: 30000,   // Refetch every 30 seconds
  },

  /**
   * Static/Reference Data
   * - Never changes (business types, countries, etc.)
   * - Cache indefinitely
   * - Fresh for 1 hour
   */
  static: {
    staleTime: 60 * 60 * 1000,  // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const

/**
 * Helper to create custom query config with specific requirements
 */
export const createQueryConfig = (
  staleTimeMs: number,
  gcTimeMs?: number,
  options?: Partial<UseQueryOptions>
) => ({
  staleTime: staleTimeMs,
  gcTime: gcTimeMs || staleTimeMs * 2,
  ...options,
})
