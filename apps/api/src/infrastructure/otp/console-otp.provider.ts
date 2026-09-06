import { Injectable, Logger } from '@nestjs/common';
import type { OtpProvider } from './otp.provider';

/** Development provider: the code is logged instead of being sent over SMS. */
@Injectable()
export class ConsoleOtpProvider implements OtpProvider {
  private readonly logger = new Logger('Otp');

  async send(phone: string, code: string): Promise<void> {
    this.logger.log(`Verification code for ${phone}: ${code}`);
  }
}
