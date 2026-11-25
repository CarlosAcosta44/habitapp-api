import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UpdateUserProfileDto, RoleName } from '../dto/user-profile.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUserStats(userId: string) {
    return this.usersRepository.getUserStats(userId);
  }

  async getProfile(userId: string, email?: string) {
    const profile = await this.usersRepository.findProfileById(userId, email);
    if (profile.estado_cuenta === 'Suspendido') {
      throw new ForbiddenException(
        'Tu cuenta se encuentra suspendida. Contacta al administrador.',
      );
    }
    return profile;
  }

  listProfiles(page?: number, limit?: number) {
    if (page !== undefined && limit !== undefined) {
      return this.usersRepository.findAllProfilesPaginated(page, limit);
    }
    return this.usersRepository.findAllProfiles();
  }

  updateProfile(userId: string, dto: UpdateUserProfileDto) {
    return this.usersRepository.updateProfile(userId, dto);
  }

  updateUserRole(
    actorId: string,
    targetUserId: string,
    dto: UpdateUserRoleDto,
  ) {
    if (actorId === targetUserId) {
      throw new BadRequestException(
        'Por seguridad no puedes cambiar tu propio rol de administrador.',
      );
    }

    const rawRole = (dto.nombrerol || dto.role || '').toString().toLowerCase();
    let targetRole: RoleName;
    if (rawRole.includes('admin')) {
      targetRole = RoleName.ADMIN;
    } else if (rawRole.includes('entrenador') || rawRole.includes('trainer')) {
      targetRole = RoleName.TRAINER;
    } else {
      targetRole = RoleName.USER;
    }

    return this.usersRepository.updateRole(targetUserId, targetRole);
  }

  updateUserStatus(
    actorId: string,
    targetUserId: string,
    dto: UpdateUserStatusDto,
  ) {
    if (actorId === targetUserId) {
      throw new BadRequestException(
        'No puedes cambiar el estado de tu propia cuenta',
      );
    }

    return this.usersRepository.updateStatus(targetUserId, dto.estado);
  }

  uploadAvatar(userId: string, file: Express.Multer.File, token?: string) {
    return this.usersRepository.uploadAvatar(userId, file, token);
  }

  updateFcmToken(userId: string, fcmToken: string) {
    return this.usersRepository.updateFcmToken(userId, fcmToken);
  }

  /** Resumen básico de perfil: nombre, fotoperfil, puntos */
  getSimpleProfile(userId: string) {
    return this.usersRepository.getSimpleProfile(userId);
  }

  /** Historial de puntos del usuario */
  getPointsHistory(userId: string, limit: number) {
    return this.usersRepository.getPointsHistory(userId, limit);
  }

  /** Logros desbloqueados por el usuario */
  getAchievements(userId: string) {
    return this.usersRepository.getAchievements(userId);
  }

  /** Entrenadores vinculados y rutinas asignadas al usuario actual */
  getMyTrainerAndRoutines(userId: string) {
    return this.usersRepository.getMyTrainerAndRoutines(userId);
  }

  /** Vincular al usuario autenticado con un entrenador */
  linkMyTrainer(userId: string, trainerId: string) {
    return this.usersRepository.linkMyTrainer(userId, trainerId);
  }

  /** Desvincular al usuario autenticado de un entrenador */
  unlinkMyTrainer(userId: string, trainerId: string) {
    return this.usersRepository.unlinkMyTrainer(userId, trainerId);
  }
}
