import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Role } from '../../../common/enums/role.enum.js';

enum UserStatus {
  PENDING_OTP = 'PENDING_OTP',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class UpdateUserDto {
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
