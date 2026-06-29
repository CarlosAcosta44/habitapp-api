import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('RESEND_API_KEY') || '';
    this.fromEmail =
      this.configService.get<string>('EMAIL_FROM') ||
      'HabitApp <onboarding@resend.dev>';
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn(
        'RESEND_API_KEY no configurada en las variables de entorno. Saltando envío de correo.',
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
