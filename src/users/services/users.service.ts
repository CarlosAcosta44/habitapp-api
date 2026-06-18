import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { UserProfileDto, UserPointsDto } from '../dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUserProfile(id: string): Promise<UserProfileDto> {
    return this.usersRepository.findById(id);
  }

  async getUserPoints(id: string): Promise<UserPointsDto> {
    const profile = await this.usersRepository.findById(id);
    return {
      idusuario: profile.idusuario,
      puntostotales: profile.puntostotales,
    };
  }
}
