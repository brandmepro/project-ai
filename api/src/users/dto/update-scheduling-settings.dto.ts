import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsNumber, IsObject } from 'class-validator';

export class UpdateSchedulingSettingsDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  autoScheduling?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  optimizeTiming?: boolean;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  minBuffer?: number; // in days

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  maxPostsPerDay?: number;

  @ApiProperty({
    required: false,
    description: 'Posting schedule by day',
    example: {
      monday: ['09:00', '14:00', '19:00'],
      tuesday: ['09:00', '14:00', '19:00'],
      wednesday: ['09:00', '14:00', '19:00'],
      thursday: ['09:00', '14:00', '19:00'],
      friday: ['09:00', '14:00', '19:00'],
      saturday: ['11:00', '17:00'],
      sunday: ['11:00', '17:00'],
    },
  })
  @IsObject()
  @IsOptional()
  postingSchedule?: Record<string, string[]>;
}
