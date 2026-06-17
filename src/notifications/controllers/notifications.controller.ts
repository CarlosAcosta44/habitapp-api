import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { UserRole } from '../../users/dto/user-profile.dto';
import { NotificationDto } from '../dto/notification.dto';
import { NotificationsService } from '../services/notifications.service';

interface AuthenticatedUser {
  userId: string;
  email?: string;
  role: UserRole;
}

@ApiTags('notifications')
@ApiBearerAuth('supabase-jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener notificaciones del usuario autenticado',
    description: 'Devuelve las últimas 30 notificaciones del usuario logueado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones.',
    type: [NotificationDto],
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  getNotifications(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.getNotificationsForUser(user.userId);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Marcar una notificación como leída',
    description:
      'Marca la notificación específica del usuario autenticado como leída.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la notificación',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Notificación marcada como leída.' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({
    status: 404,
    description: 'Notificación no encontrada o no pertenece al usuario.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) notificationId: string,
  ) {
    return this.notificationsService.markAsRead(notificationId, user.userId);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Marcar todas las notificaciones como leídas',
    description:
      'Marca todas las notificaciones no leídas del usuario autenticado como leídas.',
  })
  @ApiResponse({
    status: 204,
    description: 'Todas las notificaciones marcadas como leídas.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsRead(user.userId);
  }
}
