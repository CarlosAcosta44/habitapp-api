import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoachService } from './coach.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ClientDto } from './dto/client.dto';

@ApiTags('coach')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get('clients')
  @ApiOperation({ summary: 'Get clients assigned to the coach' })
  @ApiResponse({ status: 200, type: [ClientDto] })
  async getClients(@CurrentUser() user: any) {
    // Relying on JWT and checking the trainer_id vs current user userId
    return this.coachService.getClients(user.userId);
  }
}
