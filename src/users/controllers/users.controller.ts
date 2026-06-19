import {
  Body,
  Controller,
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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import {
  UpdateUserProfileDto,
  UserProfileDto,
  UserRole,
} from '../dto/user-profile.dto';
import { UsersService } from '../services/users.service';

interface AuthenticatedUser {
  userId: string;
  email?: string;
  role: UserRole;
}

@ApiTags('users')
@ApiBearerAuth('supabase-jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description:
      'Devuelve el perfil completo del usuario cuyo JWT se envía en el header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario.',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getProfile(user.userId);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Actualizar perfil del usuario autenticado',
    description:
      'Permite actualizar nombre, apellido y foto de perfil del usuario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado.',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({
    status: 422,
    description: 'Datos de entrada inválidos (validación).',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
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

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
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
}
