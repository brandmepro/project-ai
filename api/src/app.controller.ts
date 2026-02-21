import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from './auth/decorators/public.decorator';
import { DatabaseHealthService } from './health/database-health.service';

const API_VERSION  = '1.0.0';
const API_NAME     = 'Business Pro API';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly dbHealth: DatabaseHealthService) {}

  // ── Shared metadata ───────────────────────────────────────────────────────

  private runtimeMeta() {
    return {
      api:               API_NAME,
      version:           API_VERSION,
      environment:       process.env.NODE_ENV       || 'development',
      railway_region:    process.env.RAILWAY_REGION  || null,
      railway_service:   process.env.RAILWAY_SERVICE_NAME || null,
      active_remote_db:  process.env.REMOTE_DB_TARGET || 'railway',
      use_remote_db:     process.env.USE_REMOTE_DB === 'true',
      uptime_seconds:    Math.floor(process.uptime()),
      timestamp:         new Date().toISOString(),
    };
  }

  // ── GET /favicon.ico ─────────────────────────────────────────────────────
  // Browsers auto-request this; return 204 to silence the 404 log noise.

  @Public()
  @ApiExcludeEndpoint()
  @Get('favicon.ico')
  getFavicon(@Res() res: Response) {
    res.status(204).end();
  }

  // ── GET / ─────────────────────────────────────────────────────────────────
  // Lightweight root ping — Railway health check and quick sanity check.

  @Public()
  @ApiExcludeEndpoint()
  @Get()
  async getRoot() {
    const db = await this.dbHealth.pingActive();
    return {
      status:    db.connected ? 'healthy' : 'degraded',
      database: {
        label:     db.label,
        key:       db.key,
        connected: db.connected,
        database:  db.database,
        latencyMs: db.latencyMs,
        ...(db.error ? { error: db.error } : {}),
      },
      ...this.runtimeMeta(),
    };
  }

  // ── GET /health ───────────────────────────────────────────────────────────
  // Detailed health of the currently active DB connection.

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Active DB health — live ping + metadata' })
  @ApiResponse({ status: 200, description: 'API and active database are healthy' })
  async getHealth() {
    const db = await this.dbHealth.pingActive();
    return {
      status:    db.connected ? 'healthy' : 'degraded',
      database: {
        label:     db.label,
        key:       db.key,
        type:      db.type,
        connected: db.connected,
        database:  db.database,
        latencyMs: db.latencyMs,
        ...(db.error ? { error: db.error } : {}),
      },
      ...this.runtimeMeta(),
    };
  }

  // ── GET /health/all-dbs ───────────────────────────────────────────────────
  // Pings every registered remote DB and returns a combined status report.
  // Adding a new DB to the registry automatically includes it here.

  @Public()
  @Get('health/all-dbs')
  @ApiOperation({ summary: 'All remote DBs health — parallel ping across the registry' })
  @ApiResponse({ status: 200, description: 'Health status for every registered remote database' })
  async getAllDbsHealth() {
    const results    = await this.dbHealth.pingAllRemote();
    const allHealthy = results.every(r => r.status === 'healthy');
    const anyHealthy = results.some(r  => r.connected);

    const overallStatus = allHealthy ? 'all_healthy'
      : anyHealthy                   ? 'partial'
      : 'all_degraded';

    const summary = {
      total:        results.length,
      healthy:      results.filter(r => r.status === 'healthy').length,
      degraded:     results.filter(r => r.status === 'degraded').length,
      unconfigured: results.filter(r => r.status === 'unconfigured').length,
    };

    return {
      status:       overallStatus,
      summary,
      databases:    results.map(r => ({
        label:       r.label,
        key:         r.key,
        description: r.description,
        status:      r.status,
        connected:   r.connected,
        database:    r.database,
        host:        r.host,
        ssl:         r.ssl,
        latencyMs:   r.latencyMs,
        ...(r.error ? { error: r.error } : {}),
      })),
      ...this.runtimeMeta(),
    };
  }
}
