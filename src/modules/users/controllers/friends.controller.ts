import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards, ParseUUIDPipe, Param, Delete } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/common/guards/jwt-auth.guard';
import { FriendsService } from '../services/friends.service';
import { AddFriendDto } from '../dto/friend.dto';

@ApiTags('friends')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener lista de amigos del usuario' })
  getFriends(@Req() req: any) {
    return this.friendsService.getFriends(req.user.userId as string);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Obtener sugerencias de amigos' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getSuggestions(@Req() req: any, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 12;
    return this.friendsService.getSuggestions(
      req.user.userId as string,
      parsedLimit,
    );
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Agregar un nuevo amigo' })
  addFriend(@Body() dto: AddFriendDto, @Req() req: any) {
    return this.friendsService.addFriend(
      req.user.userId as string,
      dto.targetUserId,
    );
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aceptar solicitud de amistad' })
  acceptRequest(@Param('id', ParseUUIDPipe) friendId: string, @Req() req: any) {
    return { message: 'Solicitud aceptada (Stub)' };
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rechazar solicitud de amistad' })
  rejectRequest(@Param('id', ParseUUIDPipe) friendId: string, @Req() req: any) {
    return { message: 'Solicitud rechazada (Stub)' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un amigo' })
  removeFriend(@Param('id', ParseUUIDPipe) friendId: string, @Req() req: any) {
    return { message: 'Amigo eliminado (Stub)' };
  }
}
