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
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getProfile(user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos los usuarios (solo administrador)' })
  @ApiResponse({ status: 200, type: [UserProfileDto] })
  listUsers() {
    return this.usersService.listProfiles();
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cambiar rol de un usuario (solo administrador)' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  updateUserRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(user.userId, targetUserId, dto);
  }
}
