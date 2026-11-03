import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4096)
  captchaToken!: string;
}

export class LoginDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4096)
  captchaToken!: string;
}

export class TokenDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4096)
  token!: string;
}

export class EmailDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4096)
  refreshToken!: string;
}

export class ResetPasswordDto extends TokenDto {
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  newPassword!: string;
}
