import type { UserRole } from '../../users/entities/user.entity.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  isEmailVerified: true;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  jti: string;
  ver: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
}
