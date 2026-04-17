import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyLoginOtpDto {
  @IsString()
  @IsNotEmpty()
  national_id: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'otp_code must be exactly 6 digits' })
  otp_code: string;
}
