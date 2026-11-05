import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/common/guards/roles.guard';
import { Roles } from '../../../core/common/decorators/roles.decorator';
import { UserProfileDto, UserRole } from '../../users/dto/user-profile.dto';
import { AdminService } from '../services/admin.service';
import { UsersService } from '../../users/services/users.service';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { UpdateUserRoleDto } from '../../users/dto/update-user-role.dto';
import { UpdateUserStatusDto } from '../../users/dto/update-user-status.dto';
import { PaginationQueryDto } from '../../../core/common/dto/pagination-query.dto';
import { DeleteForumResponseDto, DeleteCommentResponseDto } from '../dto/admin.dto';

interface AuthenticatedUser {
  userId: string;
  email?: string;
  role: UserRole;
}

@ApiTags('admin')
@ApiBearerAuth('supabase-jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
  ) {}

  @Get('users')
  @ApiOperation({
    summary: 'Listar todos los usuarios',
    description: 'Solo accesible para usuarios con rol administrador. Soporta paginación opcional.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de perfiles o respuesta paginada con metadatos.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Rol insuficiente. Se requiere administrador.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  listUsers(@Query() query: PaginationQueryDto) {
    if (query?.page || query?.limit) {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      return this.usersService.listProfiles(page, limit);
    }
    return this.usersService.listProfiles();
  }

  @Patch('users/:id/status')
  @ApiOperation({
    summary: 'Cambiar estado de cuenta de un usuario',
    description:
      'Solo accesible para administradores. Modifica el estado de cuenta (Pendiente, Activo, Suspendido).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario objetivo',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de cuenta actualizado.',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Rol insuficiente. Se requiere administrador.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o intento de auto-modificación.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  updateUserStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateUserStatus(user.userId, targetUserId, dto);
  }

  @Patch('users/:id/role')
  @ApiOperation({
    summary: 'Cambiar rol de un usuario',
    description:
      'Solo accesible para administradores. Modifica el rol de otro usuario.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario objetivo',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado.',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Rol insuficiente. Se requiere administrador.',
  })
  @ApiResponse({
    status: 422,
    description: 'Datos de entrada inválidos (validación).',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  updateUserRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(user.userId, targetUserId, dto);
  }

  @Delete('forum/:id')
  @ApiOperation({
    summary: 'Eliminar un foro',
    description:
      'Elimina un foro completo y todos sus comentarios en cascada. Solo accesible para administradores.',
  })
  @ApiParam({ name: 'id', type: String, description: 'UUID del foro' })
  @ApiResponse({
    status: 200,
    description: 'Foro y comentarios eliminados exitosamente.',
    type: DeleteForumResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Rol insuficiente. Se requiere administrador.',
  })
  @ApiResponse({ status: 404, description: 'Foro no encontrado.' })
  async deleteForum(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteForum(id);
  }

  @Delete('forum/comments/:id')
  @ApiOperation({
    summary: 'Eliminar un comentario del foro',
    description:
      'Elimina un comentario específico de un foro. Solo accesible para administradores.',
  })
  @ApiParam({ name: 'id', type: String, description: 'UUID del comentario' })
  @ApiResponse({
    status: 200,
    description: 'Comentario eliminado exitosamente.',
    type: DeleteCommentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Rol insuficiente. Se requiere administrador.',
  })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado.' })
  async deleteForumComment(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteForumComment(id);
  }
}
