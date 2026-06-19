import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateUserProfileDto } from '../dto/user-profile.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  getProfile(userId: string) {
    return this.usersRepository.findProfileById(userId);
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
}
