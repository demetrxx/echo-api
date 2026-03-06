import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class SignInRequestDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ResendConfirmationCodeDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class RefreshTokenRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

export class OAuthQuery {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  redirect_uri: string;
}

export class OAuthCallbackQuery {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;
}

export class GetOAuthTokensDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class GoogleExchangeRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  codeVerifier: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  redirectUri: string;
}

export class SignOutRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

export class SignUpRequestDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fullName?: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ConfirmForgotPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ChangePasswordRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ConfirmEmailRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class EmailExistsRequestDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
