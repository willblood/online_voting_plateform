import { IsEnum, IsOptional, IsUUID, IsString, IsDateString, Matches } from 'class-validator';
import { Role } from '../../../common/enums/role.enum.js';

enum UserStatus {
  PENDING_OTP = 'PENDING_OTP',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @IsString()
  @Matches(/^\+225\d{10}$/, { message: 'phone_number must match +225XXXXXXXXXX' })
  @IsOptional()
  phone_number?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsUUID()
  @IsOptional()
  commune_id?: string;

  @IsUUID()
  @IsOptional()
  bureau_de_vote_id?: string;
}
