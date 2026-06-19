import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export enum NotificationType {
  HABITO = 'Habito',
  COMUNIDAD = 'Comunidad',
  ENTRENADOR = 'Entrenador',
  SISTEMA = 'Sistema',
}

export class CreateNotificationDto {
  @ApiProperty({
    example: 'Tienes un nuevo mensaje de tu entrenador.',
    description: 'Mensaje de la notificación.',
  })
  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.ENTRENADOR,
    description: 'Tipo de la notificación.',
  })
  @IsEnum(NotificationType)
  tipo: NotificationType;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del usuario destinatario.',
  })
  @IsUUID()
  idusuario: string;
}

export class NotificationDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'UUID de la notificación.',
  })
  id: string;

  @ApiProperty({
    example: '¡Has completado tu reto de hoy!',
    description: 'Mensaje de la notificación.',
  })
  message: string;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.HABITO,
    description: 'Tipo de la notificación.',
  })
  type: NotificationType;

  @ApiProperty({
    example: false,
    description: 'Estado de lectura de la notificación.',
  })
  isRead: boolean;

  @ApiProperty({
    example: '2026-06-17T12:00:00.000Z',
    description: 'Fecha y hora de creación de la notificación.',
  })
  createdAt: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del usuario al que pertenece la notificación.',
  })
  userId: string;
}
