import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);

  constructor(private readonly config: ConfigService) {}

  async verify(token: string, remoteIp?: string): Promise<void> {
    const body = new URLSearchParams({
      secret: this.config.getOrThrow<string>('RECAPTCHA_SECRET_KEY'),
      response: token,
    });
    if (remoteIp) body.set('remoteip', remoteIp);

    let response: Response;
    try {
      response = await fetch(
        this.config.get<string>('CAPTCHA_VERIFY_URL') ?? 'https://www.google.com/recaptcha/api/siteverify',
        {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(5000),
        },
      );
    } catch {
      this.logger.warn('CAPTCHA provider unavailable');
      throw new UnauthorizedException('CAPTCHA verification failed');
    }

    if (!response.ok) throw new UnauthorizedException('CAPTCHA verification failed');
    let result: RecaptchaResponse;
    try {
      result = (await response.json()) as RecaptchaResponse;
    } catch {
      throw new UnauthorizedException('CAPTCHA verification failed');
    }
    const challengeTime = result.challenge_ts ? Date.parse(result.challenge_ts) : Number.NaN;
    if (
      !result.success ||
      !Number.isFinite(challengeTime) ||
      Date.now() - challengeTime > 120_000 ||
      challengeTime > Date.now() + 30_000 ||
      (this.config.get<string>('RECAPTCHA_EXPECTED_HOSTNAME') !== undefined &&
        result.hostname !== this.config.get<string>('RECAPTCHA_EXPECTED_HOSTNAME'))
    ) {
      throw new UnauthorizedException('CAPTCHA verification failed');
    }
  }
}
