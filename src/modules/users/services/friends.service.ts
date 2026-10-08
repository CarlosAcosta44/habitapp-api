import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FriendsRepository } from '../repositories/friends.repository';

@Injectable()
export class FriendsService {
  constructor(private readonly friendsRepo: FriendsRepository) {}

  async addFriend(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException(
        'No puedes agregarte a ti mismo como amigo',
      );
    }

    const targetExists = await this.friendsRepo.targetUserExists(targetUserId);
    if (!targetExists) {
      throw new NotFoundException('El usuario que intentas agregar no existe');
    }

    const alreadyFriends = await this.friendsRepo.existsRelation(
      userId,
      targetUserId,
    );
    if (alreadyFriends) {
      throw new BadRequestException('Este usuario ya está en tu red de amigos');
    }

    await this.friendsRepo.createAcceptedRelation(userId, targetUserId);
    return { success: true };
  }

  async getFriends(userId: string) {
    return this.friendsRepo.getAcceptedFriends(userId);
  }

  async getSuggestions(userId: string, limit = 12) {
    return this.friendsRepo.getFriendSuggestions(userId, limit);
  }
}
