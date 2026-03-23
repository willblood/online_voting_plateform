import {
  IsEmail,
  IsEnum,
  IsString,
  IsUUID,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { Role } from '../../../common/enums/role.enum.js';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  national_id: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsUUID()
  municipality_id: string;
}
