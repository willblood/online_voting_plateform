import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
 @IsString()
 @IsOptional()
 phone_number?: string;

 @IsString()
 @IsOptional()
 first_name?: string;

 @IsString()
 @IsOptional()
 last_name?: string;
}