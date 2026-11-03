import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleDestroy {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from = config.getOrThrow<string>('SMTP_FROM');
    this.transporter = nodemailer.createTransport({
      host: config.getOrThrow<string>('SMTP_HOST'),
      port: config.getOrThrow<number>('SMTP_PORT'),
      secure: Number(config.get<string>('SMTP_PORT')) === 465,
      requireTLS: Number(config.get<string>('SMTP_PORT')) !== 465,
      auth: {
        user: config.getOrThrow<string>('SMTP_USER'),
        pass: config.getOrThrow<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${this.frontendUrl()}/confirm-email?token=${encodeURIComponent(token)}`;
    await this.send(to, 'Verify your email', `<h1>Verify your email</h1><p><a href="${link}">Confirm email address</a></p><p>This link expires in 24 hours.</p>`);
  }

  async sendWelcomeEmail(to: string): Promise<void> {
    await this.send(to, 'Welcome', '<h1>Welcome</h1><p>Your email address is verified and your account is ready.</p>');
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const link = `${this.frontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;
    await this.send(to, 'Reset your password', `<h1>Password reset</h1><p><a href="${link}">Reset password</a></p><p>This link expires in 1 hour.</p>`);
  }

  async onModuleDestroy(): Promise<void> {
    this.transporter.close();
  }

  private frontendUrl(): string {
    return this.config.getOrThrow<string>('FRONTEND_URL').replace(/\/$/, '');
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch {
      this.logger.error(`Failed to send email: ${subject}`);
      throw new Error('Email delivery failed');
    }
  }
}
