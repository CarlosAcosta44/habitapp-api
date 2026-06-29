import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

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
}
