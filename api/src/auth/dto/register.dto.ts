import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{2}\d{10}$/, {
    message: 'national_id must be 2 uppercase letters followed by 10 digits (e.g. CI0012345678)',
  })
  national_id: string;

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
  @Matches(/^\+225\d{10}$/, {
    message: 'phone_number must be a valid Ivorian number in format +225XXXXXXXXXX',
  })
  phone_number: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsUUID()
  commune_id: string;

  @IsUUID()
  @IsOptional()
  bureau_de_vote_id?: string;
}
