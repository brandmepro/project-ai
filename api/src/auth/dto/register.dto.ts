import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessType } from '../../common/enums';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'My Awesome Cafe', required: false })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiProperty({ enum: BusinessType, required: false, example: 'cafe' })
  @IsEnum(BusinessType)
  @IsOptional()
  businessType?: BusinessType;

  @ApiProperty({ 
    type: [String], 
    required: false, 
    example: ['awareness', 'engagement'],
    description: 'Content goals: awareness, engagement, promotion, festival'
  })
  @IsArray()
  @IsOptional()
  goals?: string[];
}
