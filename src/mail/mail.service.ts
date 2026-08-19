import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private fromEmail: string;
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey =
      this.configService.get<string>('RESEND_API_KEY') ||
      're_dummy_key_for_dev';
    this.resend = new Resend(apiKey);
    this.fromEmail =
      this.configService.get<string>('MAIL_FROM') || 'noreply@habitapp.io';
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;

    try {
      await this.resend.emails.send({
        from: `HabitApp <${this.fromEmail}>`,
        to: email,
        subject: 'Verifica tu cuenta en HabitApp',
        html: `
          <h1>¡Bienvenido a HabitApp!</h1>
          <p>Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send verification email', error);
      // Log errors but don't fail the request completely for missing keys
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: `HabitApp <${this.fromEmail}>`,
        to: email,
        subject: 'Recuperación de contraseña',
        html: `
          <h1>Recuperación de Contraseña</h1>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send reset email', error);
    }
  }
}
