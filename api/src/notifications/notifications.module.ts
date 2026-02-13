import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSettings } from './entities/notification-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationSettings])],
  exports: [TypeOrmModule],
})
export class NotificationsModule {}
