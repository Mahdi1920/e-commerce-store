import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum, IsString, IsBoolean, IsArray } from 'class-validator';
import { UserRole } from '../../common/enums/role.enum';

export class CreateUserDto {
  @IsNotEmpty() 
  fullname: string;

  @IsNotEmpty() 
  username: string;

  @IsEmail() 
  email: string;

  @MinLength(6) 
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

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
