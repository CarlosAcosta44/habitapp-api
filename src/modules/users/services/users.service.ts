import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateUserProfileDto } from '../dto/user-profile.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUserStats(userId: string) {
    return this.usersRepository.getUserStats(userId);
  }

  getProfile(userId: string, email?: string) {
    return this.usersRepository.findProfileById(userId, email);
  }

  listProfiles() {
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
        'No puedes cambiar tu propio rol desde este endpoint',
      );
    }

    return this.usersRepository.updateRole(targetUserId, dto.nombrerol);
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
}
