import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoachService } from './coach.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { ClientDto } from './dto/client.dto';
import { UserRole } from '../users/dto/user-profile.dto';

@ApiTags('coach')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRAINER, UserRole.ADMIN)
@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get('clients')
  @ApiOperation({ summary: 'Get clients assigned to the coach' })
  @ApiResponse({ status: 200, type: [ClientDto] })
  async getClients(@CurrentUser() user: any) {
    return this.coachService.getClients(user.userId);
  }
}
