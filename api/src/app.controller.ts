import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private async dbPing(): Promise<{ connected: boolean; type: string; database: string; latencyMs: number | null }> {
    const opts = this.dataSource.options as any;
    const dbName = opts.database || (opts.url ? new URL(opts.url).pathname.replace('/', '') : 'unknown');
    const useRemote = process.env.USE_REMOTE_DB === 'true';
    const type = useRemote ? 'Supabase (Direct)' : 'PostgreSQL (Local)';

    if (!this.dataSource.isInitialized) {
      return { connected: false, type, database: dbName, latencyMs: null };
    }

    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      return { connected: true, type, database: dbName, latencyMs: Date.now() - start };
    } catch {
      return { connected: false, type, database: dbName, latencyMs: null };
    }
  }

  @Public()
  @ApiExcludeEndpoint()
  @Get()
  async getHealth() {
    const db = await this.dbPing();
    return {
      status: db.connected ? 'healthy' : 'degraded',
      api: 'Business Pro API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime_seconds: Math.floor(process.uptime()),
      database: db,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check — API status + live DB ping latency' })
  @ApiResponse({ status: 200, description: 'Server is healthy' })
  async healthCheck() {
    const db = await this.dbPing();
    return {
      status: db.connected ? 'healthy' : 'degraded',
      uptime_seconds: Math.floor(process.uptime()),
      database: db,
      timestamp: new Date().toISOString(),
    };
  }
}
