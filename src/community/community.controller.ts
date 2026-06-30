import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('forums')
  getForums(@CurrentUser() user: any) {
    return this.communityService.getForums(user.userId);
  }

  @Get('forums/:id/comments')
  getComments(@Param('id') forumId: string) {
    return this.communityService.getComments(forumId);
  }

  @Post('comments')
  createComment(@Body() dto: any, @CurrentUser() user: any) {
    return this.communityService.createComment({ ...dto, idUsuario: user.userId });
  }

  @Post('react')
  toggleReaction(@Body() dto: any, @CurrentUser() user: any) {
    return this.communityService.toggleReaction({ ...dto, idUsuario: user.userId });
  }

  @Post('forums/:id/subscribe')
  subscribeToForum(@Param('id') forumId: string, @CurrentUser() user: any) {
    return this.communityService.subscribeToForum(user.userId, forumId);
  }

  @Delete('forums/:id/subscribe')
  unsubscribeFromForum(@Param('id') forumId: string, @CurrentUser() user: any) {
    return this.communityService.unsubscribeFromForum(user.userId, forumId);
  }

  @Get('articles')
  getArticles() {
    return this.communityService.getArticles();
  }

  @Get('trainers')
  getTrainers() {
    return this.communityService.getTrainers();
  }
}
