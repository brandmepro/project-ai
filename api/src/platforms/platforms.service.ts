import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformConnection } from './entities/platform-connection.entity';
import { Platform } from '../common/enums';

@Injectable()
export class PlatformsService {
  constructor(
    @InjectRepository(PlatformConnection)
    private platformRepository: Repository<PlatformConnection>,
  ) {}

  async getAllConnections(userId: string): Promise<any[]> {
    // Get all existing connections from DB
    const existingConnections = await this.platformRepository.find({
      where: { userId },
    });

    // All available platforms
    const allPlatforms = Object.values(Platform);

    // Map to include all platforms with their connection status
    return allPlatforms.map(platform => {
      const connection = existingConnections.find(c => c.platform === platform);
      
      if (connection) {
        return connection;
      }
      
      // Return placeholder for non-connected platforms
      return {
        platform,
        userId,
        isConnected: false,
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
        platformData: {},
        connectedAt: null,
        createdAt: null,
        updatedAt: null,
      };
    });
  }

  async getConnectionStatus(userId: string, platform: Platform) {
    const connection = await this.platformRepository.findOne({
      where: { userId, platform },
    });

    return {
      platform,
      isConnected: connection?.isConnected || false,
      connectedAt: connection?.connectedAt || null,
      platformData: connection?.platformData || {},
    };
  }

  async connect(
    userId: string,
    platform: Platform,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date,
    platformData?: any,
  ): Promise<PlatformConnection> {
    let connection = await this.platformRepository.findOne({
      where: { userId, platform },
    });

    if (connection) {
      // Update existing connection
      connection.isConnected = true;
      connection.accessToken = accessToken;
      connection.refreshToken = refreshToken;
      connection.tokenExpiresAt = expiresAt;
      connection.platformData = platformData || {};
    } else {
      // Create new connection
      connection = this.platformRepository.create({
        userId,
        platform,
        isConnected: true,
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
        platformData: platformData || {},
      });
    }

    return this.platformRepository.save(connection);
  }

  async disconnect(userId: string, platform: Platform): Promise<void> {
    const connection = await this.platformRepository.findOne({
      where: { userId, platform },
    });

    if (!connection) {
      throw new NotFoundException(
        `Connection for ${platform} not found`,
      );
    }

    connection.isConnected = false;
    connection.accessToken = null;
    connection.refreshToken = null;
    connection.tokenExpiresAt = null;

    await this.platformRepository.save(connection);
  }

  async getConnectedPlatforms(userId: string): Promise<string[]> {
    const connections = await this.platformRepository.find({
      where: { userId, isConnected: true },
    });

    return connections.map((c) => c.platform);
  }
}
