import {
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
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
import { UserRole } from '../users/dto/user-profile.dto';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth('supabase-jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Delete('forum/threads/:id')
  @ApiOperation({
    summary: 'Eliminar un hilo del foro',
    description:
      'Elimina un hilo del foro y todos sus comentarios en cascada. Solo accesible para administradores.',
  })
  @ApiParam({ name: 'id', type: String, description: 'UUID del hilo' })
  @ApiResponse({ status: 200, description: 'Hilo y comentarios eliminados exitosamente.' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente. Se requiere administrador.' })
  @ApiResponse({ status: 404, description: 'Hilo no encontrado.' })
  async deleteForumThread(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteForumThread(id);
  }

  @Delete('forum/comments/:id')
  @ApiOperation({
    summary: 'Eliminar un comentario del foro',
    description:
      'Elimina un comentario específico de un hilo. Solo accesible para administradores.',
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
