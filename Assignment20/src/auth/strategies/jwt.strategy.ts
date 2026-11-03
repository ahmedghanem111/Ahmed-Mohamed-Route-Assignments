import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';
import { RedisService } from '../../redis/redis.service.js';
import type { AuthenticatedUser, JwtPayload } from '../interfaces/auth-user.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
    private readonly redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (await this.redis.get(`auth:revoked:${payload.jti}`)) {
      throw new UnauthorizedException('Invalid authentication token');
    }
    const user = await this.users.findById(payload.sub).catch(() => null);
    if (
      !user ||
      !user.isEmailVerified ||
      user.role !== payload.role ||
      user.tokenVersion !== payload.ver
    ) {
      throw new UnauthorizedException('Invalid authentication token');
    }
    return { id: user.id, email: user.email, role: user.role, isEmailVerified: true };
  }
}
