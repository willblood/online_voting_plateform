import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCandidateDto {
  @IsUUID()
  @IsOptional()
  party_id?: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsOptional()
  photo_url?: string;

  @IsString()
  @IsOptional()
  biography?: string;

  @IsString()
  @IsOptional()
  program_url?: string;

  @IsUUID()
  @IsOptional()
  running_mate_id?: string;

  @IsBoolean()
  @IsOptional()
  nationality_verified?: boolean;

  @IsBoolean()
  @IsOptional()
  criminal_record_clear?: boolean;

  @IsBoolean()
  @IsOptional()
  age_verified?: boolean;
}
