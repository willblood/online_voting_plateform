import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsDateString()
  date_of_birth: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  gender: string;
}
