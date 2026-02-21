import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Client as PgClient } from 'pg';
import {
  RemoteDatabase,
  REMOTE_DB_REGISTRY,
  getAllRemoteDbs,
  getActiveRemoteDb,
} from '../config/remote-database.enum';

// ─── Result shapes ─────────────────────────────────────────────────────────

export interface SingleDbHealth {
  label:       string;
  key:         string;
  description: string;
  status:      'healthy' | 'degraded' | 'unconfigured';
  connected:   boolean;
  latencyMs:   number | null;
  database:    string | null;
  host:        string | null;
  ssl:         boolean;
  error?:      string;
}

export interface ActiveDbHealth {
  label:      string;
  key:        string;
  connected:  boolean;
  database:   string;
  type:       string;
  latencyMs:  number | null;
  error?:     string;
}

// ─── Service ───────────────────────────────────────────────────────────────

@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** Quick ping of the active (injected) DataSource — used by / and /health */
  async pingActive(): Promise<ActiveDbHealth> {
    const useRemote = process.env.USE_REMOTE_DB === 'true';

    let label: string;
    let key:   string;
    let type:  string;

    if (useRemote) {
      const { target, definition } = getActiveRemoteDb();
      label = definition.label;
      key   = target;
      type  = definition.label;
    } else {
      label = 'Local PostgreSQL';
      key   = 'local';
      type  = 'Local PostgreSQL';
    }

    const opts = this.dataSource.options as any;
    const rawDb = opts.database ??
      (opts.url ? (() => { try { return new URL(opts.url).pathname.replace('/', ''); } catch { return 'unknown'; } })() : 'unknown');

    if (!this.dataSource.isInitialized) {
      return { label, key, connected: false, database: rawDb, type, latencyMs: null, error: 'DataSource not initialized' };
    }

    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      return { label, key, connected: true, database: rawDb, type, latencyMs: Date.now() - start };
    } catch (err: any) {
      return { label, key, connected: false, database: rawDb, type, latencyMs: null, error: err?.message };
    }
  }

  /** Ping every registered remote DB and return combined results — used by /health/all-dbs */
  async pingAllRemote(): Promise<SingleDbHealth[]> {
    const dbs = getAllRemoteDbs();
    const results = await Promise.allSettled(dbs.map(({ key, definition, url }) =>
      this.pingRemoteDb(key, definition.label, definition.description, definition.ssl, url),
    ));

    return results.map((result, idx) => {
      if (result.status === 'fulfilled') return result.value;
      const { key, definition } = dbs[idx];
      return {
        label:       definition.label,
        key,
        description: definition.description,
        status:      'degraded' as const,
        connected:   false,
        latencyMs:   null,
        database:    null,
        host:        null,
        ssl:         definition.ssl,
        error:       (result.reason as Error)?.message ?? 'Unknown error',
      };
    });
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async pingRemoteDb(
    key:         RemoteDatabase,
    label:       string,
    description: string,
    ssl:         boolean,
    url:         string | undefined,
  ): Promise<SingleDbHealth> {
    if (!url) {
      return {
        label, key, description,
        status:    'unconfigured',
        connected: false,
        latencyMs: null,
        database:  null,
        host:      null,
        ssl,
        error:     `${REMOTE_DB_REGISTRY[key].envVar} is not set`,
      };
    }

    let host   = '?';
    let dbName = '?';

    try {
      const u = new URL(url.split('?')[0]);
      host   = u.hostname;
      dbName = u.pathname.replace(/^\//, '');
    } catch { /* ignore URL parse error */ }

    const client = new PgClient({
      connectionString:        url,
      ssl:                     ssl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 6_000,
    });

    try {
      const start = Date.now();
      await client.connect();
      await client.query('SELECT 1');
      const latencyMs = Date.now() - start;
      await client.end().catch(() => {});

      return { label, key, description, status: 'healthy', connected: true, latencyMs, database: dbName, host, ssl };
    } catch (err: any) {
      await client.end().catch(() => {});
      this.logger.warn(`[all-dbs] ${label} unreachable: ${err?.message}`);
      return { label, key, description, status: 'degraded', connected: false, latencyMs: null, database: dbName, host, ssl, error: err?.message };
    }
  }
}
