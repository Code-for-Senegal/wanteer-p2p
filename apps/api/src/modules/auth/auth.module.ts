import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TOKENS } from '@wantere/config';
import type { Env } from '../../config/env';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PhoneVerificationService } from './phone-verification.service';
import { SessionService } from './session.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: { expiresIn: TOKENS.accessTtl },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionService, PhoneVerificationService],
  exports: [JwtModule, SessionService],
})
export class AuthModule {}
