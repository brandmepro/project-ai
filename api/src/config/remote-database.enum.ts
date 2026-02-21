/**
 * Remote Database Registry
 *
 * To add a new remote database in the future:
 *   1. Add a value to RemoteDatabase enum
 *   2. Add a matching entry in REMOTE_DB_REGISTRY
 *   3. Add the corresponding env var to .env
 *   That's it — health checks, config loading, and migration runner all
 *   auto-discover the registry at runtime.
 */

// ─── Enum ────────────────────────────────────────────────────────────────────

export enum RemoteDatabase {
  RAILWAY  = 'railway',
  SUPABASE = 'supabase',
  NEON     = 'neon',
}

// ─── Registry entry shape ────────────────────────────────────────────────────

export interface RemoteDbDefinition {
  /** Short human-readable label shown in health responses */
  label: string;
  /** Name of the env var that holds the connection URL */
  envVar: string;
  /** Whether to connect with SSL (railway internal = false, cloud = true) */
  ssl: boolean;
  /** One-line description for the /health/all-dbs endpoint */
  description: string;
}

// ─── Registry ────────────────────────────────────────────────────────────────
// Add new entries below — every registered DB appears in /health/all-dbs automatically.

export const REMOTE_DB_REGISTRY: Record<RemoteDatabase, RemoteDbDefinition> = {
  [RemoteDatabase.RAILWAY]: {
    label:       'Railway PostgreSQL',
    envVar:      'RAILWAY_DATABASE_URL',
    ssl:         false,   // private Railway internal network needs no SSL
    description: 'Railway-hosted PostgreSQL (same private network as the API)',
  },

  [RemoteDatabase.SUPABASE]: {
    label:       'Supabase PostgreSQL',
    envVar:      'SUPABASE_DATABASE_URL',
    ssl:         true,
    description: 'Supabase Direct Connection (needs Supabase IPv4 add-on for Railway)',
  },

  [RemoteDatabase.NEON]: {
    label:       'Neon PostgreSQL',
    envVar:      'NEON_DATABASE_URL',
    ssl:         true,
    description: 'Neon serverless PostgreSQL (connection pooler)',
  },
};

// ─── Runtime helpers ─────────────────────────────────────────────────────────

/**
 * Reads REMOTE_DB_TARGET from process.env and returns the active DB's
 * definition + connection URL.  Defaults to RAILWAY if the variable is
 * absent or contains an unrecognised value.
 */
export function getActiveRemoteDb(): {
  target:     RemoteDatabase;
  definition: RemoteDbDefinition;
  url:        string | undefined;
} {
  const raw = process.env.REMOTE_DB_TARGET ?? RemoteDatabase.RAILWAY;
  const target = (Object.values(RemoteDatabase) as string[]).includes(raw)
    ? (raw as RemoteDatabase)
    : RemoteDatabase.RAILWAY;

  const definition = REMOTE_DB_REGISTRY[target];
  const url        = process.env[definition.envVar];
  return { target, definition, url };
}

/**
 * Returns every registered remote DB with its URL resolved from process.env.
 * Used by the /health/all-dbs endpoint.
 */
export function getAllRemoteDbs(): Array<{
  key:        RemoteDatabase;
  definition: RemoteDbDefinition;
  url:        string | undefined;
}> {
  return (Object.values(RemoteDatabase) as RemoteDatabase[]).map(key => ({
    key,
    definition: REMOTE_DB_REGISTRY[key],
    url:        process.env[REMOTE_DB_REGISTRY[key].envVar],
  }));
}
