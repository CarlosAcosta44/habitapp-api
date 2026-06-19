import { Injectable, Logger } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { EmailService } from './email.service';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  CreateNotificationDto,
  NotificationDto,
} from '../dto/notification.dto';
import { NotificationRow } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly emailService: EmailService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getNotificationsForUser(userId: string): Promise<NotificationDto[]> {
    const rows = await this.notificationsRepository.findByUser(userId);
    return rows.map((row) => this.mapRowToDto(row));
  }

  async createNotification(
    dto: CreateNotificationDto,
  ): Promise<NotificationDto> {
    const row = await this.notificationsRepository.create(dto);
    const dtoResponse = this.mapRowToDto(row);

    // Intentamos enviar una notificación por correo electrónico de manera asíncrona
    // sin bloquear el retorno de la petición HTTP del usuario
    this.sendNotificationEmailAsync(dto.idusuario, dto.mensaje, dto.tipo).catch(
      (err) => {
        const error = err as Error;
        this.logger.error(
          `Fallo asíncrono al intentar enviar correo: ${error.message}`,
        );
      },
    );

    return dtoResponse;
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationsRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.markAllAsRead(userId);
  }

  private async sendNotificationEmailAsync(
    userId: string,
    message: string,
    type: string,
  ): Promise<void> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.admin.getUserById(userId);

      if (error || !data?.user || !data.user.email) {
        this.logger.warn(
          `No se pudo obtener el correo para el usuario ${userId} para enviar la notificación.`,
        );
        return;
      }

      const email = data.user.email;
      const subject = `HabitApp: Nueva notificación de ${type}`;
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">¡Hola de parte de HabitApp!</h2>
          <p>Tienes una nueva notificación de tipo <strong>${type}</strong>:</p>
          <blockquote style="background: #f3f4f6; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0;">
            ${message}
          </blockquote>
          <p>Inicia sesión en HabitApp para ver más detalles.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <span style="font-size: 12px; color: #9ca3af;">Este es un mensaje automático de HabitApp. Por favor, no respondas a este correo.</span>
        </div>
      `;

      await this.emailService.sendEmail(email, subject, html);
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Error al intentar enviar correo de notificación al usuario ${userId}: ${error.message}`,
      );
    }
  }

  private mapRowToDto(row: NotificationRow): NotificationDto {
    return {
      id: row.idnotificacion,
      message: row.mensaje,
      type: row.tipo as any,
      isRead: row.leida,
      createdAt: row.fecha,
      userId: row.idusuario,
    };
  }
}
