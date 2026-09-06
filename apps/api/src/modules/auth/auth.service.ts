import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { PhoneVerificationService } from './phone-verification.service';
import { SessionService, type IssuedTokens } from './session.service';
import type { Env } from '../../config/env';
import type { LoginDto, RegisterDto, VerifyOtpDto } from './dto/auth.dto';

interface RequestContext {
  userAgent?: string | null;
  ipAddress?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
    private readonly verifications: PhoneVerificationService,
    private readonly storage: StorageService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });

    if (existing?.phoneVerified) {
      throw new ConflictException('This phone number is already registered');
    }

    const user =
      existing ??
      (await this.prisma.user.create({
        data: {
          phone: dto.phone,
          profile: { create: { displayName: dto.displayName } },
        },
      }));

    if (existing) {
      await this.prisma.profile.update({
        where: { userId: user.id },
        data: { displayName: dto.displayName },
      });
    }

    return this.challenge(dto.phone, user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });

    if (!user || user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Unable to sign in with this phone number');
    }

    return this.challenge(dto.phone, user.id);
  }

  async verify(dto: VerifyOtpDto, context: RequestContext = {}): Promise<IssuedTokens> {
    await this.verifications.consume(dto.phone, dto.code);

    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });

    if (!user) {
      throw new UnauthorizedException('Unknown phone number');
    }

    const activated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        status: user.status === 'PENDING' ? 'ACTIVE' : user.status,
        lastSeenAt: new Date(),
      },
    });

    const device = dto.platform
      ? await this.prisma.device.create({
          data: { userId: user.id, platform: dto.platform, name: dto.deviceName ?? null },
        })
      : null;

    return this.sessions.start(
      { id: activated.id, role: activated.role },
      { deviceId: device?.id ?? null, ...context },
    );
  }

  refresh(refreshToken: string): Promise<IssuedTokens> {
    return this.sessions.rotate(refreshToken);
  }

  logout(sessionId: string): Promise<void> {
    return this.sessions.revoke(sessionId);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { profile: true },
    });

    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      status: user.status,
      displayName: user.profile?.displayName ?? null,
      avatarUrl: user.profile?.avatarKey ? this.storage.publicUrl(user.profile.avatarKey) : null,
    };
  }

  private async challenge(phone: string, userId: string) {
    const { expiresAt, code } = await this.verifications.issue(phone, userId);
    const isProduction = this.config.get('NODE_ENV', { infer: true }) === 'production';

    return {
      phone,
      expiresAt: expiresAt.toISOString(),
      ...(isProduction ? {} : { code }),
    };
  }
}
