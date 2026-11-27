import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly gmailUser: string;
  private readonly smtpTransporter: Transporter | null;

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

    this.apiKey = this.configService.get<string>('RESEND_API_KEY') || '';
    this.fromEmail =
      this.configService.get<string>('EMAIL_FROM') ||
      `HabitApp <${this.gmailUser}>`;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (this.smtpTransporter) {
      try {
        await this.smtpTransporter.sendMail({
          from: `"HabitApp" <${this.gmailUser}>`,
          to,
          subject,
          html,
        });
        this.logger.log(`Correo enviado exitosamente vía Gmail SMTP a ${to}.`);
        return true;
      } catch (smtpErr) {
        const err = smtpErr as Error;
        this.logger.error(
          `Error al enviar correo vía Gmail SMTP a ${to}: ${err.message}`,
        );
      }
    }

    if (!this.apiKey) {
      this.logger.warn(
        'GMAIL_APP_PASSWORD / RESEND_API_KEY no configuradas. Saltando envío de correo.',
      );
      return false;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject,
          html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(
          `Error al enviar correo vía Resend: ${JSON.stringify(data)}`,
        );
        return false;
      }

      this.logger.log(`Correo enviado exitosamente a ${to}. ID: ${data.id}`);
      return true;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Excepción al enviar correo a ${to}: ${err.message}`);
      return false;
    }
  }
}
