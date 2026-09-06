import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { TOKENS } from '@wantere/config';
import type { UserRole } from '@wantere/types';
import { PrismaService } from '../../database/prisma.service';
import type { Env } from '../../config/env';

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface SessionContext {
  deviceId?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
}

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async start(
    user: { id: string; role: UserRole },
    context: SessionContext = {},
  ): Promise<IssuedTokens> {
    const refreshToken = this.generateRefreshToken();

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        deviceId: context.deviceId ?? null,
        userAgent: context.userAgent ?? null,
        ipAddress: context.ipAddress ?? null,
        refreshTokenHash: await argon2.hash(refreshToken),
        expiresAt: this.refreshExpiry(),
      },
    });

    return {
      accessToken: await this.signAccessToken(user, session.id),
      refreshToken: this.encodeRefreshToken(session.id, refreshToken),
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  /**
   * Refresh tokens rotate: the presented session is revoked and linked to its
   * replacement, so replaying an old token is detectable.
   */
  async rotate(presented: string): Promise<IssuedTokens> {
    const { sessionId, secret } = this.decodeRefreshToken(presented);

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    if (!(await argon2.verify(session.refreshTokenHash, secret))) {
      await this.revokeAllForUser(session.userId);
      throw new UnauthorizedException('Session is no longer valid');
    }

    const nextSecret = this.generateRefreshToken();

    const next = await this.prisma.$transaction(async (tx) => {
      const created = await tx.session.create({
        data: {
          userId: session.userId,
          deviceId: session.deviceId,
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
          refreshTokenHash: await argon2.hash(nextSecret),
          expiresAt: this.refreshExpiry(),
        },
      });

      await tx.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date(), replacedById: created.id },
      });

      return created;
    });

    return {
      accessToken: await this.signAccessToken(
        { id: session.userId, role: session.user.role },
        next.id,
      ),
      refreshToken: this.encodeRefreshToken(next.id, nextSecret),
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  async revoke(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private signAccessToken(user: { id: string; role: UserRole }, sessionId: string) {
    return this.jwt.signAsync(
      { sub: user.id, role: user.role, sid: sessionId },
      { expiresIn: TOKENS.accessTtl },
    );
  }

  private generateRefreshToken(): string {
    return randomBytes(48).toString('base64url');
  }

  private encodeRefreshToken(sessionId: string, secret: string): string {
    return `${sessionId}.${secret}`;
  }

  private decodeRefreshToken(token: string): { sessionId: string; secret: string } {
    const separator = token.indexOf('.');
    const sessionId = separator > 0 ? token.slice(0, separator) : '';
    const secret = separator > 0 ? token.slice(separator + 1) : '';

    if (!sessionId || !secret) {
      throw new UnauthorizedException('Malformed refresh token');
    }

    return { sessionId, secret };
  }

  private refreshExpiry(): Date {
    return new Date(Date.now() + TOKENS.refreshTtlDays * 24 * 60 * 60 * 1000);
  }

  isProduction(): boolean {
    return this.config.get('NODE_ENV', { infer: true }) === 'production';
  }
}
