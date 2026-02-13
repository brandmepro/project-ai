import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settings } from './entities/settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Settings])],
  exports: [TypeOrmModule],
})
export class SettingsModule {}
