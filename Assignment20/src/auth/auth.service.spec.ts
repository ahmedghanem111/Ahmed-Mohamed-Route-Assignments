import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const verifiedUser = {
    id: 'user-1',
    email: 'person@example.com',
    passwordHash: 'password-hash',
    isEmailVerified: true,
    role: 'user' as const,
    tokenVersion: 0,
  };

  function createService() {
    const users = {
      findByEmail: vi.fn(),
      findByEmailWithPassword: vi.fn(),
      findById: vi.fn(),
    };
    const hashing = {
      hash: vi.fn().mockResolvedValue('hash'),
      compare: vi.fn(),
    };
    const jwt = {
      signAsync: vi.fn().mockResolvedValue('signed-token'),
      verifyAsync: vi.fn(),
    };
    const redis = {
      deleteIfValueMatches: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined),
    };
    const email = {};
    const captcha = { verify: vi.fn().mockResolvedValue(undefined) };
    const config = {
      getOrThrow: (key: string) =>
        ({
          JWT_ACCESS_SECRET: 'a'.repeat(40),
          JWT_REFRESH_SECRET: 'b'.repeat(40),
          JWT_ACCESS_EXPIRES_IN: '15m',
          JWT_REFRESH_EXPIRES_IN: '7d',
        })[key],
    };
    const service = new AuthService(
      users as never,
      hashing as never,
      jwt as never,
      redis as never,
      email as never,
      captcha as never,
      config as never,
    );
    return { service, users, hashing, jwt, redis };
  }

  it('rejects login before email verification', async () => {
    const { service, users, hashing } = createService();
    users.findByEmailWithPassword.mockResolvedValue({ ...verifiedUser, isEmailVerified: false });
    hashing.compare.mockResolvedValue(true);

    await expect(service.login('person@example.com', 'password', 'captcha')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects incorrect credentials', async () => {
    const { service, users, hashing } = createService();
    users.findByEmailWithPassword.mockResolvedValue(null);
    hashing.compare.mockResolvedValue(false);

    await expect(service.login('person@example.com', 'wrong-password', 'captcha')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects duplicate email registration', async () => {
    const { service, users } = createService();
    users.findByEmail.mockResolvedValue(verifiedUser);

    await expect(
      service.register('person@example.com', 'a long password value', 'captcha'),
    ).rejects.toThrow('already exists');
  });

  it('rotates a refresh token once and rejects its replay', async () => {
    const { service, users, jwt, redis } = createService();
    jwt.verifyAsync.mockResolvedValue({ sub: verifiedUser.id, jti: 'token-id', ver: 0 });
    users.findById.mockResolvedValue(verifiedUser);
    redis.deleteIfValueMatches.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const tokens = await service.refresh('old-refresh-token');
    expect(tokens.tokenType).toBe('Bearer');
    await expect(service.refresh('old-refresh-token')).rejects.toThrow(UnauthorizedException);
    expect(jwt.signAsync).toHaveBeenCalledTimes(2);
  });
});
