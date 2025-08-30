import { IsEmail, IsOptional, MinLength, IsEnum, IsString, IsBoolean, IsArray, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../common/enums/role.enum';

export class UpdateUserDto {
  @IsNotEmpty()
  id: string;
  
  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  wishlist?: string[];

  @IsOptional()
  @IsArray()
  orders?: string[];
}
