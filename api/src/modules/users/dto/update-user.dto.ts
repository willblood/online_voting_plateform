import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Role } from '../../../common/enums/role.enum.js';

export class UpdateUserDto {
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsUUID()
  @IsOptional()
  municipality_id?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
