import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateCommentDto, ToggleReactionDto } from './dto/community.dto';

@ApiTags('community')
@ApiBearerAuth('supabase-jwt')
@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('forums')
  @ApiOperation({ summary: 'Obtener lista de foros activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de foros retornada con éxito.',
  })
  getForums(@CurrentUser() user: any) {
    return this.communityService.getForums(user.userId);
  }

  @Get('forums/:id/comments')
  @ApiOperation({
    summary: 'Obtener todos los comentarios de un foro específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Comentarios retornados con éxito.',
  })
  getComments(@Param('id') forumId: string) {
    return this.communityService.getComments(forumId);
  }

  @Post('comments')
  @ApiOperation({
    summary:
      'Crear un nuevo comentario en un foro o responder a otro comentario',
  })
  @ApiResponse({ status: 201, description: 'Comentario creado con éxito.' })
  createComment(@Body() dto: CreateCommentDto, @CurrentUser() user: any) {
    return this.communityService.createComment({
      ...dto,
      idUsuario: user.userId,
    });
  }

  @Post('react')
  @ApiOperation({
    summary:
      'Dar o quitar una reacción (Me gusta, Me motiva, Util) a un comentario o artículo',
  })
  @ApiResponse({ status: 200, description: 'Reacción actualizada con éxito.' })
  toggleReaction(@Body() dto: ToggleReactionDto, @CurrentUser() user: any) {
    return this.communityService.toggleReaction({
      ...dto,
      idUsuario: user.userId,
    });
  }

  @Post('forums/:id/subscribe')
  @ApiOperation({
    summary: 'Suscribirse a un foro para recibir notificaciones',
  })
  @ApiResponse({ status: 200, description: 'Suscrito con éxito.' })
  subscribeToForum(@Param('id') forumId: string, @CurrentUser() user: any) {
    return this.communityService.subscribeToForum(user.userId, forumId);
  }

  @Delete('forums/:id/subscribe')
  @ApiOperation({ summary: 'Cancelar la suscripción a un foro' })
  @ApiResponse({ status: 200, description: 'Suscripción cancelada con éxito.' })
  unsubscribeFromForum(@Param('id') forumId: string, @CurrentUser() user: any) {
    return this.communityService.unsubscribeFromForum(user.userId, forumId);
  }

  @Get('articles')
  @ApiOperation({ summary: 'Obtener lista de artículos educativos publicados' })
  @ApiResponse({ status: 200, description: 'Artículos retornados con éxito.' })
  getArticles() {
    return this.communityService.getArticles();
  }

  @Get('trainers')
  @ApiOperation({
    summary: 'Obtener lista de entrenadores disponibles en la comunidad',
  })
  @ApiResponse({
    status: 200,
    description: 'Entrenadores retornados con éxito.',
  })
  getTrainers() {
    return this.communityService.getTrainers();
  }
}
