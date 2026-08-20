import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FriendsService } from './services/friends.service';
import { AddFriendDto } from '../records/dto/create-record.dto';

@ApiTags('friends')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener lista de amigos del usuario' })
  getFriends(@Req() req: any) {
    return this.friendsService.getFriends(req.user.idusuario as string);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Obtener sugerencias de amigos' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getSuggestions(@Req() req: any, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 12;
    return this.friendsService.getSuggestions(
      req.user.idusuario as string,
      parsedLimit,
    );
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Agregar un nuevo amigo' })
  addFriend(@Body() dto: AddFriendDto, @Req() req: any) {
    return this.friendsService.addFriend(
      req.user.idusuario as string,
      dto.targetUserId,
    );
  }
}
