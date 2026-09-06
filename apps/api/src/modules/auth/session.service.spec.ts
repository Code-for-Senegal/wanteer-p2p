import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { SessionService } from './session.service';
import { PrismaService } from '../../database/prisma.service';

describe('SessionService', () => {
  const sessionRecord = {
    id: '3f1a8f0e-0000-4000-8000-000000000001',
    userId: '3f1a8f0e-0000-4000-8000-000000000002',
    deviceId: null,
    userAgent: null,
    ipAddress: null,
    refreshTokenHash: '',
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    user: { role: 'USER' },
  };

  const prisma = {
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: SessionService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('access') } },
        { provide: ConfigService, useValue: { get: () => 'test' } },
      ],
    }).compile();

    service = moduleRef.get(SessionService);
  });

  it('issues a refresh token bound to the created session', async () => {
    prisma.session.create.mockResolvedValue({ ...sessionRecord });

    const tokens = await service.start({ id: sessionRecord.userId, role: 'USER' });

    expect(tokens.refreshToken.startsWith(`${sessionRecord.id}.`)).toBe(true);
    expect(tokens.accessToken).toBe('access');
  });

  it('revokes every session when a stale refresh token is replayed', async () => {
    prisma.session.findUnique.mockResolvedValue({
      ...sessionRecord,
      refreshTokenHash: await argon2.hash('the-real-secret'),
    });

    await expect(service.rotate(`${sessionRecord.id}.a-stolen-secret`)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: { userId: sessionRecord.userId, revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('rejects a malformed refresh token', async () => {
    await expect(service.rotate('not-a-token')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
