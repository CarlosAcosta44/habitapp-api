import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CoachService } from './coach.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { ClientDto } from './dto/client.dto';
import { UserRole } from '../users/dto/user-profile.dto';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

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
      'Devuelve la lista de usuarios asignados al entrenador autenticado. Solo accesible para roles entrenador y administrador.',
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

  @Post('routines')
  @ApiOperation({ summary: 'Crear una rutina con hábitos asociados' })
  @ApiResponse({ status: 201, description: 'Rutina creada exitosamente.' })
  async createRoutine(
    @CurrentUser() user: any,
    @Body() dto: CreateRoutineDto,
  ) {
    return this.coachService.createRoutine(user.userId, dto);
  }

  @Get('routines')
  @ApiOperation({ summary: 'Obtener todas las rutinas del entrenador' })
  @ApiResponse({ status: 200, description: 'Lista de rutinas.' })
  async getRoutines(@CurrentUser() user: any) {
    return this.coachService.getRoutines(user.userId);
  }

  @Get('routines/:id')
  @ApiOperation({ summary: 'Obtener el detalle de una rutina' })
  @ApiParam({ name: 'id', type: String, description: 'UUID de la rutina' })
  @ApiResponse({ status: 200, description: 'Detalle de la rutina.' })
  @ApiResponse({ status: 404, description: 'Rutina no encontrada.' })
  async getRoutineById(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.coachService.getRoutineById(user.userId, id);
  }

  @Patch('routines/:id')
  @ApiOperation({ summary: 'Actualizar una rutina y sus hábitos' })
  @ApiParam({ name: 'id', type: String, description: 'UUID de la rutina' })
  @ApiResponse({ status: 200, description: 'Rutina actualizada.' })
  async updateRoutine(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoutineDto,
  ) {
    return this.coachService.updateRoutine(user.userId, id, dto);
  }

  @Delete('routines/:id')
  @ApiOperation({ summary: 'Eliminar una rutina' })
  @ApiParam({ name: 'id', type: String, description: 'UUID de la rutina' })
  @ApiResponse({ status: 200, description: 'Rutina eliminada exitosamente.' })
  async deleteRoutine(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.coachService.deleteRoutine(user.userId, id);
  }

  @Post('clients/:clientId/routines/:routineId/assign')
  @ApiOperation({
    summary: 'Asignar una rutina a un cliente',
    description:
      'Copia los hábitos de la rutina seleccionada y los inserta en el perfil del cliente como hábitos personales activos. El entrenador debe tener asignado al cliente.',
  })
  @ApiParam({ name: 'clientId', type: String, description: 'UUID del cliente (pupilo)' })
  @ApiParam({ name: 'routineId', type: String, description: 'UUID de la rutina a asignar' })
  @ApiResponse({
    status: 201,
    description: 'Rutina asignada exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente.' })
  @ApiResponse({ status: 404, description: 'Cliente no asignado al entrenador o rutina no encontrada.' })
  async assignRoutine(
    @CurrentUser() user: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Param('routineId', ParseUUIDPipe) routineId: string,
  ) {
    return this.coachService.assignRoutineToClient(
      user.userId,
      clientId,
      routineId,
    );
  }
}
