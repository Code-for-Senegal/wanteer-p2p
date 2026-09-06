import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import * as argon2 from 'argon2';
import { OTP } from '@wantere/config';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { OTP_PROVIDER, type OtpProvider } from '../../infrastructure/otp/otp.provider';

@Injectable()
export class PhoneVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @Inject(OTP_PROVIDER) private readonly otp: OtpProvider,
  ) {}

  async issue(phone: string, userId?: string): Promise<{ expiresAt: Date; code: string }> {
    await this.assertNotThrottled(phone);

    const code = String(randomInt(0, 10 ** OTP.codeLength)).padStart(OTP.codeLength, '0');
    const expiresAt = new Date(Date.now() + OTP.ttlSeconds * 1000);

    await this.prisma.phoneVerification.updateMany({
      where: { phone, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    await this.prisma.phoneVerification.create({
      data: {
        phone,
        userId: userId ?? null,
        codeHash: await argon2.hash(code),
        expiresAt,
      },
    });

    await this.otp.send(phone, code);

    return { expiresAt, code };
  }

  async consume(phone: string, code: string): Promise<void> {
    const verification = await this.prisma.phoneVerification.findFirst({
      where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new BadRequestException('No pending verification for this number');
    }

    if (verification.attempts >= OTP.maxAttempts) {
      throw new BadRequestException('Too many failed attempts, request a new code');
    }

    if (!(await argon2.verify(verification.codeHash, code))) {
      await this.prisma.phoneVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { consumedAt: new Date() },
    });
  }

  private async assertNotThrottled(phone: string): Promise<void> {
    const key = `otp:cooldown:${phone}`;
    const hits = await this.redis.increment(key, OTP.resendCooldownSeconds);

    if (hits > 1) {
      throw new HttpException(
        'A code was already sent, try again in a moment',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
