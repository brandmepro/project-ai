import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlatformsService } from './platforms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Platform } from '../common/enums';

@ApiTags('Platforms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('platforms')
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all platform connections' })
  @ApiResponse({
    status: 200,
    description: 'List of all platform connections',
  })
  async getAllConnections(@CurrentUser('id') userId: string) {
    return this.platformsService.getAllConnections(userId);
  }

  @Get('connected')
  @ApiOperation({ summary: 'Get list of connected platforms' })
  @ApiResponse({
    status: 200,
    description: 'Array of connected platform names',
  })
  async getConnectedPlatforms(@CurrentUser('id') userId: string) {
    return this.platformsService.getConnectedPlatforms(userId);
  }

  @Get(':platform/status')
  @ApiOperation({ summary: 'Get connection status for a platform' })
  @ApiResponse({
    status: 200,
    description: 'Connection status and details',
  })
  async getStatus(
    @CurrentUser('id') userId: string,
    @Param('platform') platform: Platform,
  ) {
    return this.platformsService.getConnectionStatus(userId, platform);
  }

  @Post(':platform/connect')
  @ApiOperation({ summary: 'Connect a social media platform' })
  @ApiResponse({
    status: 200,
    description: 'Platform connected successfully',
  })
  async connect(
    @CurrentUser('id') userId: string,
    @Param('platform') platform: Platform,
    @Body()
    connectionData: {
      accessToken: string;
      refreshToken?: string;
      expiresAt?: Date;
      platformData?: any;
    },
  ) {
    return this.platformsService.connect(
      userId,
      platform,
      connectionData.accessToken,
      connectionData.refreshToken,
      connectionData.expiresAt,
      connectionData.platformData,
    );
  }

  @Delete(':platform/disconnect')
  @ApiOperation({ summary: 'Disconnect a social media platform' })
  @ApiResponse({
    status: 200,
    description: 'Platform disconnected successfully',
  })
  async disconnect(
    @CurrentUser('id') userId: string,
    @Param('platform') platform: Platform,
  ) {
    await this.platformsService.disconnect(userId, platform);
    return { message: `${platform} disconnected successfully` };
  }
}
