import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreatePartyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  acronym: string;

  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsInt()
  @Min(1800)
  @IsOptional()
  founded_year?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
