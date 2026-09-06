import { Global, Module } from '@nestjs/common';
import { ConsoleOtpProvider } from './console-otp.provider';
import { OTP_PROVIDER } from './otp.provider';

@Global()
@Module({
  providers: [{ provide: OTP_PROVIDER, useClass: ConsoleOtpProvider }],
  exports: [OTP_PROVIDER],
})
export class OtpModule {}
