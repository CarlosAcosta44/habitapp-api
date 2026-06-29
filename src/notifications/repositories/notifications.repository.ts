import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { NotificationRow } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/notification.dto';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findByUser(userId: string): Promise<NotificationRow[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('notificaciones')
      .select('*')
      .eq('idusuario', userId)
      .order('fecha', { ascending: false })
      .limit(30)
      .returns<NotificationRow[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al buscar notificaciones: ${error.message}`,
      );
    }

    return data ?? [];
  }

  async findById(notificationId: string): Promise<NotificationRow> {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('notificaciones')
      .select('*')
      .eq('idnotificacion', notificationId)
      .single<NotificationRow>();

    if (error || !data) {
      throw new NotFoundException(
        `Notificación con ID ${notificationId} no encontrada`,
      );
    }

    return data;
  }

  async create(dto: CreateNotificationDto): Promise<NotificationRow> {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('notificaciones')
      .insert({
        mensaje: dto.mensaje,
        tipo: dto.tipo,
        idusuario: dto.idusuario,
        leida: false,
      })
      .select()
      .single<NotificationRow>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al crear la notificación: ${error.message}`,
      );
    }

    return data;
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    // Primero validamos que la notificación exista y pertenezca al usuario
    await this.findById(notificationId);

    const { error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('notificaciones')
      .update({ leida: true })
      .eq('idnotificacion', notificationId)
      .eq('idusuario', userId);

    if (error) {
      throw new InternalServerErrorException(
        `Error al marcar la notificación como leída: ${error.message}`,
      );
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('notificaciones')
      .update({ leida: true })
      .eq('idusuario', userId)
      .eq('leida', false);

    if (error) {
      throw new InternalServerErrorException(
        `Error al marcar todas las notificaciones como leídas: ${error.message}`,
      );
    }
  }
}
