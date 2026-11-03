import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { CaptchaService } from '../captcha/captcha.service.js';
import { EmailService } from '../email/email.service.js';
import { HashingService } from '../hashing/hashing.service.js';
import { RedisService } from '../redis/redis.service.js';
import { UsersService } from '../users/users.service.js';
import type { UserEntity } from '../users/entities/user.entity.js';
import type { AuthTokens, JwtPayload } from './interfaces/auth-user.interface.js';

const VERIFY_TTL_SECONDS = 24 * 60 * 60;
const RESET_TTL_SECONDS = 60 * 60;
const GENERIC_EMAIL_MESSAGE = 'If the account is eligible, an email will be sent shortly.';

@Injectable()
export class AuthService {
  private readonly dummyHash: Promise<string>;

  constructor(
    private readonly users: UsersService,
    private readonly hashing: HashingService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly email: EmailService,
    private readonly captcha: CaptchaService,
    private readonly config: ConfigService,
  ) {
    this.dummyHash = hashing.hash(randomUUID());
  }

  async register(email: string, password: string, captchaToken: string, remoteIp?: string) {
    await this.captcha.verify(captchaToken, remoteIp);
    const normalizedEmail = email.trim().toLowerCase();
    if (await this.users.findByEmail(normalizedEmail)) {
      throw new ConflictException('An account with this email already exists');
    }

    let user: UserEntity;
    try {
      user = await this.users.create({
        email: normalizedEmail,
        passwordHash: await this.hashing.hash(password),
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('An account with this email already exists');
      }
      throw error;
    }

    await this.sendVerification(user);
    return { message: 'Check your email to verify your account.' };
  }

  async confirmEmail(token: string) {
    const userId = await this.redis.consume(this.tokenKey('verify', token));
    if (!userId) throw new UnauthorizedException('Invalid or expired verification token');
    const user = await this.users.markEmailVerified(userId);
    await this.email.sendWelcomeEmail(user.email);
    return { message: 'Email verified successfully.' };
  }

  async resendConfirmation(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const allowed = await this.redis.allow(
      `ratelimit:resend:${this.digest(normalizedEmail)}`,
      3,
      3600,
    );
    if (!allowed) {
      throw new HttpException('Please wait before requesting another email.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const user = await this.users.findByEmail(normalizedEmail);
    if (user && !user.isEmailVerified) await this.sendVerification(user);
    return { message: GENERIC_EMAIL_MESSAGE };
  }

  async login(email: string, password: string, captchaToken: string, remoteIp?: string): Promise<AuthTokens> {
    await this.captcha.verify(captchaToken, remoteIp);
    const user = await this.users.findByEmailWithPassword(email.trim().toLowerCase());
    const passwordMatches = await this.hashing.compare(
      user?.passwordHash ?? (await this.dummyHash),
      password,
    );
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Email or password is incorrect');
    }
    if (!user.isEmailVerified) throw new UnauthorizedException('Email verification is required');
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenKey = `auth:refresh:${payload.sub}`;
    const consumed = await this.redis.deleteIfValueMatches(tokenKey, this.digest(refreshToken));
    if (!consumed) {
      throw new UnauthorizedException('Refresh token has already been used or revoked');
    }
    const user = await this.users.findById(payload.sub).catch(() => null);
    if (!user?.isEmailVerified || user.tokenVersion !== payload.ver) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      const key = `auth:refresh:${payload.sub}`;
      if (await this.redis.deleteIfValueMatches(key, this.digest(refreshToken))) {
        await this.redis.set(
          `auth:revoked:${payload.jti}`,
          '1',
          this.durationSeconds(this.config.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN')),
        );
      }
    } catch {
      // Logout is idempotent and does not disclose token validity.
    }
    return { message: 'Logged out successfully.' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const allowed = await this.redis.allow(
      `ratelimit:forgot:${this.digest(normalizedEmail)}`,
      3,
      3600,
    );
    if (!allowed) return { message: GENERIC_EMAIL_MESSAGE };

    const user = await this.users.findByEmail(normalizedEmail);
    if (user && user.isEmailVerified) {
      const token = randomBytes(32).toString('base64url');
      await this.redis.set(this.tokenKey('reset', token), user.id, RESET_TTL_SECONDS);
      await this.email.sendPasswordResetEmail(user.email, token);
    }
    return { message: GENERIC_EMAIL_MESSAGE };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const userId = await this.redis.consume(this.tokenKey('reset', token));
    if (!userId) throw new UnauthorizedException('Invalid or expired reset token');
    await this.users.updatePassword(userId, await this.hashing.hash(newPassword));
    await this.redis.delete(`auth:refresh:${userId}`);
    return { message: 'Password reset successfully.' };
  }

  private async sendVerification(user: UserEntity): Promise<void> {
    const token = randomBytes(32).toString('base64url');
    await this.redis.set(this.tokenKey('verify', token), user.id, VERIFY_TTL_SECONDS);
    await this.email.sendVerificationEmail(user.email, token);
  }

  private async issueTokens(user: UserEntity): Promise<AuthTokens> {
    const jti = randomUUID();
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti,
      ver: user.tokenVersion,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });
    const lifetime = this.durationSeconds(this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'));
    await this.redis.set(`auth:refresh:${user.id}`, this.digest(refreshToken), lifetime);
    return { accessToken, refreshToken, tokenType: 'Bearer' };
  }

  private tokenKey(purpose: 'verify' | 'reset', token: string): string {
    return `auth:${purpose}:${this.digest(token)}`;
  }

  private digest(value: string): string {
    return createHmac('sha256', this.config.getOrThrow<string>('JWT_REFRESH_SECRET'))
      .update(value)
      .digest('hex');
  }

  private durationSeconds(value: string): number {
    const match = /^(\d+)(s|m|h|d)$/.exec(value);
    if (!match) throw new Error('JWT expiration must use a value such as 15m or 7d');
    const amount = Number(match[1]);
    return amount * ({ s: 1, m: 60, h: 3600, d: 86400 } as const)[match[2] as 's' | 'm' | 'h' | 'd'];
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
  }
}
