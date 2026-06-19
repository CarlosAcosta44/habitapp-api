import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CoachService } from './coach.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { ClientDto } from './dto/client.dto';
import { UserRole } from '../users/dto/user-profile.dto';

@ApiTags('coach')
@ApiBearerAuth('supabase-jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRAINER, UserRole.ADMIN)
@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get('clients')
  @ApiOperation({
    summary: 'Obtener clientes asignados al entrenador',
    description:
      'Devuelve la lista de usuarios asignados al entrenador autenticado. ' +
      'Solo accesible para roles entrenador y administrador.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes asignados.',
    type: [ClientDto],
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Rol insuficiente. Se requiere entrenador o administrador.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async getClients(@CurrentUser() user: any) {
    return this.coachService.getClients(user.userId);
  }
}
