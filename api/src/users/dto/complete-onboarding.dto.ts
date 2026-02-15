import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsArray } from 'class-validator';
import { BusinessType } from '../../common/enums';

export class CompleteOnboardingDto {
  @ApiProperty({ description: 'Business name' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ 
    description: 'Type of business',
    enum: BusinessType
  })
  @IsEnum(BusinessType)
  @IsNotEmpty()
  businessType: BusinessType;

  @ApiProperty({ 
    description: 'Content goals for the business',
    type: [String],
    example: ['awareness', 'engagement', 'promotion']
  })
  @IsArray()
  @IsString({ each: true })
  goals: string[];
}
