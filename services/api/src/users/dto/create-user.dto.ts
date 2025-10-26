import { IsEmail, IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '@random-truffle/types';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  tenantId: string;
}
