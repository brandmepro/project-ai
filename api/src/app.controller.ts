import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private dbStatus() {
    const connected = this.dataSource.isInitialized;
    const opts = this.dataSource.options as any;
    const dbName = opts.database || (opts.url ? new URL(opts.url).pathname.replace('/', '') : 'unknown');
    const useRemote = process.env.USE_REMOTE_DB === 'true';
    return {
      connected,
      type: useRemote ? 'Supabase (Remote)' : 'PostgreSQL (Local)',
      database: dbName,
    };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Root health check — API + database status' })
  @ApiResponse({ status: 200, description: 'Server is operational' })
  getHealth() {
    const db = this.dbStatus();
    return {
      status: db.connected ? 'healthy' : 'degraded',
      message: 'Business Pro API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: db,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check — API + database status' })
  @ApiResponse({ status: 200, description: 'Server is healthy' })
  healthCheck() {
    const db = this.dbStatus();
    return {
      status: db.connected ? 'healthy' : 'degraded',
      database: db,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
