import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly smtpTransporter: Transporter | null;
  private readonly gmailUser: string;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.gmailUser =
      this.configService.get<string>('GMAIL_USER') || 'habitapp296@gmail.com';
    const gmailAppPassword = (
      this.configService.get<string>('GMAIL_APP_PASSWORD') || ''
    )
      .replaceAll(/\s+/g, '')
      .trim();

    if (this.gmailUser && gmailAppPassword) {
      this.smtpTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: this.gmailUser,
          pass: gmailAppPassword,
        },
      });
    } else {
      this.smtpTransporter = null;
    }

    const apiKey =
      this.configService.get<string>('RESEND_API_KEY') ||
      're_dummy_key_for_dev';
    this.resend = new Resend(apiKey);
    this.fromEmail =
      this.configService.get<string>('MAIL_FROM') || this.gmailUser;
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  private async deliverEmail(to: string, subject: string, html: string) {
    if (this.smtpTransporter) {
      try {
        await this.smtpTransporter.sendMail({
          from: `"HabitApp" <${this.gmailUser}>`,
          to,
          subject,
          html,
        });
        this.logger.log(`Correo enviado vía Gmail SMTP a ${to}`);
        return;
      } catch (smtpError) {
        const err = smtpError as Error;
        this.logger.error(
          `Error al enviar correo vía Gmail SMTP a ${to}: ${err.message}`,
        );
      }
    }

    try {
      await this.resend.emails.send({
        from: `HabitApp <${this.fromEmail}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error al enviar correo a ${to}: ${err.message}`);
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h1 style="color: #572de4; font-size: 22px;">¡Bienvenido a HabitApp!</h1>
        <p>Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
        <p style="margin: 24px 0;">
          <a href="${verificationUrl}" style="background-color: #572de4; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
            Verificar mi correo
          </a>
        </p>
        <p style="font-size: 13px; color: #64748b;">Si no creaste esta cuenta, puedes ignorar este correo.</p>
      </div>
    `;
    await this.deliverEmail(email, 'Verifica tu cuenta en HabitApp', html);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${this.frontendUrl}/update-password?token=${encodeURIComponent(token)}`;
    const html = `
      <div lang="es" style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 28px; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <h1 style="color: #572de4; font-size: 22px; margin-top: 0; margin-bottom: 16px;">Recuperación de Contraseña — HabitApp</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Hola, recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>HabitApp</strong>.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Haz clic en el siguiente botón para crear tu nueva contraseña (este enlace es válido durante <strong>15 minutos</strong>):
        </p>
        <p style="margin: 28px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #572de4; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block;">
            Restablecer mi contraseña
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">
          Si no solicitaste este cambio, puedes ignorar este correo de forma segura y tu contraseña seguirá siendo la misma.
        </p>
      </div>
    `;
    await this.deliverEmail(
      email,
      'Recuperación de contraseña — HabitApp',
      html,
    );
  }
}
