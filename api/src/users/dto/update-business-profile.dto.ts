import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { BusinessType } from '../../common/enums';

export class UpdateBusinessProfileDto {
  @ApiPropertyOptional({ description: 'Business name' })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiPropertyOptional({ enum: BusinessType, description: 'Business type' })
  @IsEnum(BusinessType)
  @IsOptional()
  businessType?: BusinessType;

  @ApiPropertyOptional({ description: 'Business description' })
  @IsString()
  @IsOptional()
  businessDescription?: string;
}
