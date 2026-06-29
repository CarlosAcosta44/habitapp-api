import {
  Body,
  Controller,
  Delete,
  Get,
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserProfileDto, UserRole } from '../users/dto/user-profile.dto';
import { AdminService } from './admin.service';
import { UsersService } from '../users/services/users.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateUserRoleDto } from '../users/dto/update-user-role.dto';

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
    description: 'Solo accesible para usuarios con rol administrador.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de perfiles.',
    type: [UserProfileDto],
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Rol insuficiente. Se requiere administrador.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  listUsers() {
    return this.usersService.listProfiles();
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
  @ApiResponse({ status: 200, description: 'Foro y comentarios eliminados exitosamente.' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente. Se requiere administrador.' })
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
  @ApiResponse({ status: 200, description: 'Comentario eliminado exitosamente.' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente. Se requiere administrador.' })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado.' })
  async deleteForumComment(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteForumComment(id);
  }
}
