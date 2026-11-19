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
import { CoachService } from '../services/coach.service';
import { JwtAuthGuard } from '../../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/common/guards/roles.guard';
import { Roles } from '../../../core/common/decorators/roles.decorator';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ClientDto } from '../dto/client.dto';
import { UserRole } from '../../users/dto/user-profile.dto';
import { CreateRoutineDto } from '../dto/create-routine.dto';
import { UpdateRoutineDto } from '../dto/update-routine.dto';

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
  async createRoutine(@CurrentUser() user: any, @Body() dto: CreateRoutineDto) {
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
  @ApiParam({
    name: 'clientId',
    type: String,
    description: 'UUID del cliente (pupilo)',
  })
  @ApiParam({
    name: 'routineId',
    type: String,
    description: 'UUID de la rutina a asignar',
  })
  @ApiResponse({
    status: 201,
    description: 'Rutina asignada exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente.' })
  @ApiResponse({
    status: 404,
    description: 'Cliente no asignado al entrenador o rutina no encontrada.',
  })
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

  @Get('clients/:clientId/progress')
  @ApiOperation({
    summary: 'Obtener el progreso de un cliente',
    description:
      'Retorna el resumen de progreso (rachas, estadísticas) de un cliente asignado. La información es delegada internamente al motor de reportes del sistema.',
  })
  @ApiParam({
    name: 'clientId',
    type: String,
    description: 'UUID del cliente (pupilo)',
  })
  @ApiResponse({
    status: 200,
    description: 'Progreso del cliente obtenido exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente.' })
  @ApiResponse({
    status: 404,
    description: 'Cliente no asignado al entrenador.',
  })
  async getClientProgress(
    @CurrentUser() user: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.coachService.getClientProgress(user.userId, clientId);
  }

  @Post('clients/:clientId/recommendation')
  @ApiOperation({ summary: 'Enviar recomendación o notificación a un cliente' })
  @ApiParam({ name: 'clientId', type: String, description: 'UUID del cliente' })
  @ApiResponse({ status: 201, description: 'Recomendación enviada exitosamente.' })
  async sendRecommendation(
    @CurrentUser() user: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: { message: string; type?: string },
  ) {
    return this.coachService.sendRecommendation(user.userId, clientId, dto);
  }

  @Get('available-clients')
  @ApiOperation({ summary: 'Obtener usuarios del sistema disponibles para vincular' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios disponibles.' })
  async getAvailableClients(@CurrentUser() user: any) {
    return this.coachService.getAvailableClients(user.userId);
  }

  @Post('clients/:clientId/link')
  @ApiOperation({ summary: 'Vincular un cliente al entrenador' })
  @ApiParam({ name: 'clientId', type: String, description: 'UUID del cliente' })
  @ApiResponse({ status: 201, description: 'Cliente vinculado exitosamente.' })
  async linkClient(
    @CurrentUser() user: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.coachService.linkClient(user.userId, clientId);
  }

  @Delete('clients/:clientId/link')
  @ApiOperation({ summary: 'Desvincular un cliente del entrenador' })
  @ApiParam({ name: 'clientId', type: String, description: 'UUID del cliente' })
  @ApiResponse({ status: 200, description: 'Cliente desvinculado exitosamente.' })
  async unlinkClient(
    @CurrentUser() user: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.coachService.unlinkClient(user.userId, clientId);
  }

  @Get('clients/:clientId/recommendations')
  @ApiOperation({ summary: 'Obtener historial de recomendaciones enviadas a un cliente' })
  @ApiParam({ name: 'clientId', type: String, description: 'UUID del cliente' })
  @ApiResponse({ status: 200, description: 'Historial de recomendaciones.' })
  async getClientRecommendations(
    @CurrentUser() user: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.coachService.getClientRecommendations(user.userId, clientId);
  }
}
