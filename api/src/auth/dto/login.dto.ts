import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  /** Accepts a national ID (e.g. CI0012345678) or an email address */
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
