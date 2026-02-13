import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePlatformPreferencesDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  autoCrosspost?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  platformOptimizations?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  tagLocation?: boolean;
}
