import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
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

  @ApiProperty({ example: 'My Business Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: BusinessType, required: false, example: 'cafe' })
  @IsEnum(BusinessType)
  @IsOptional()
  businessType?: BusinessType;
}
