import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';
import { OTP } from '@wantere/config';

const E164 = /^\+[1-9]\d{7,14}$/;

export class RegisterDto {
  @ApiProperty({ example: '+221770000000' })
  @Matches(E164, { message: 'phone must be in E.164 format' })
  phone!: string;

  @ApiProperty({ example: 'Awa Diop' })
  @IsString()
  @Length(2, 60)
  displayName!: string;
}

export class LoginDto {
  @ApiProperty({ example: '+221770000000' })
  @Matches(E164, { message: 'phone must be in E.164 format' })
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+221770000000' })
  @Matches(E164, { message: 'phone must be in E.164 format' })
  phone!: string;

  @ApiProperty({ example: '123456' })
  @Matches(/^\d+$/, { message: 'code must contain digits only' })
  @Length(OTP.codeLength, OTP.codeLength)
  code!: string;

  @ApiPropertyOptional({ enum: ['ios', 'android', 'web'] })
  @IsOptional()
  @IsIn(['ios', 'android', 'web'])
  platform?: string;

  @ApiPropertyOptional({ example: 'Pixel 8' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  deviceName?: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @MaxLength(512)
  refreshToken!: string;
}

export class OtpChallengeDto {
  @ApiProperty() phone!: string;
  @ApiProperty() expiresAt!: string;
  @ApiPropertyOptional({ description: 'Only returned outside production' })
  code?: string;
}

export class AuthTokensDto {
  @ApiProperty() accessToken!: string;
  @ApiProperty() refreshToken!: string;
  @ApiProperty() expiresIn!: number;
}

export class SessionUserDto {
  @ApiProperty() id!: string;
  @ApiProperty() phone!: string;
  @ApiProperty() role!: string;
  @ApiProperty() status!: string;
  @ApiProperty({ nullable: true }) displayName!: string | null;
  @ApiProperty({ nullable: true }) avatarUrl!: string | null;
}
