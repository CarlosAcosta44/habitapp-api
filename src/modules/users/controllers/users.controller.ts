import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/common/guards/roles.guard';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';

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

  @Get('me/stats')
  @ApiOperation({
    summary: 'Obtener estadísticas del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del usuario (tasa de éxito, racha, etc).',
  })
  getUserStats(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getUserStats(user.userId);
  }

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
    return this.usersService.getProfile(user.userId, user.email);
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
        .addFileTypeValidator({
          fileType: '.(png|jpeg|jpg|webp)',
          fallbackToMimetype: true,
        })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 + 1 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
    @Req() req: any,
  ) {
    let token = null;
    if (req.cookies && req.cookies['access_token']) {
      token = req.cookies['access_token'];
    } else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    return this.usersService.uploadAvatar(user.userId, file, token);
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
    const parsedLimit = Number.parseInt(limit ?? '20', 10);
    return this.usersService.getPointsHistory(user.userId, parsedLimit);
  }

  @Get('me/achievements')
  @ApiOperation({ summary: 'Logros desbloqueados por el usuario' })
  getAchievements(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getAchievements(user.userId);
  }

  @Patch('me/fcm-token')
  @ApiOperation({
    summary: 'Registrar token FCM para notificaciones Push',
    description: 'Guarda el token de Firebase Cloud Messaging del dispositivo móvil del usuario.',
  })
  @ApiResponse({ status: 200, description: 'Token FCM actualizado exitosamente.' })
  updateFcmToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body('fcm_token') fcmToken: string,
  ) {
    return this.usersService.updateFcmToken(user.userId, fcmToken);
  }

  @Get('me/trainer')
  @ApiOperation({
    summary: 'Obtener entrenadores vinculados y rutinas asignadas del usuario actual',
  })
  getMyTrainerAndRoutines(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMyTrainerAndRoutines(user.userId);
  }

  @Post('me/trainer/:trainerId')
  @ApiOperation({
    summary: 'Vincular al usuario actual como cliente/pupilo de un entrenador',
  })
  linkMyTrainer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('trainerId') trainerId: string,
  ) {
    return this.usersService.linkMyTrainer(user.userId, trainerId);
  }

  @Delete('me/trainer/:trainerId')
  @ApiOperation({
    summary: 'Desvincular al usuario actual de un entrenador',
  })
  unlinkMyTrainer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('trainerId') trainerId: string,
  ) {
    return this.usersService.unlinkMyTrainer(user.userId, trainerId);
  }
}
