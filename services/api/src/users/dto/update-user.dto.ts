import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@random-truffle/types';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
