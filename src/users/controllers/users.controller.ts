import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UserProfileDto, UserPointsDto } from '../dto/user-profile.dto';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/profile')
  async getProfile(@Param('id') id: string): Promise<UserProfileDto> {
    return this.usersService.getUserProfile(id);
  }

  @Get(':id/points')
  async getPoints(@Param('id') id: string): Promise<UserPointsDto> {
    return this.usersService.getUserPoints(id);
  }
}
