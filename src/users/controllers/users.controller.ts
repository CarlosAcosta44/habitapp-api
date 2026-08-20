import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
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
@ApiCookieAuth()
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

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir foto de perfil',
    description:
      'Sube un archivo de imagen al bucket de Supabase y actualiza la URL en el perfil.',
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar actualizado exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido o faltante.' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor o en el bucket.',
  })
  uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(user.userId, file);
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Resumen básico de perfil: nombre, foto y puntos' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getSimpleProfile(user.userId);
  }

  @Get('me/points-history')
  @ApiOperation({ summary: 'Historial de puntos del usuario' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de registros (default: 20)',
  })
  getPointsHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.usersService.getPointsHistory(user.userId, parsedLimit);
  }

  @Get('me/achievements')
  @ApiOperation({ summary: 'Logros desbloqueados por el usuario' })
  getAchievements(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getAchievements(user.userId);
  }
}
