import { Controller, Get, Post, Body, Param, Req, UseGuards, HttpCode, HttpStatus, UnauthorizedException, UseInterceptors, UploadedFile, ParseFilePipeBuilder, Put, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommunityService } from '../services/community.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/common/guards/jwt-auth.guard'; // Asumiendo que existe

@ApiTags('community')
@Controller('users/community')
export class ComunidadController {
  constructor(private readonly comunidadService: CommunityService) {}

  // ================= Foros =================
  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de la comunidad' })
  async getStats() {
    return this.comunidadService.getStats();
  }

  @Get('foros')
  @ApiOperation({ summary: 'Obtener todos los foros/temas' })
  async getForums(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.comunidadService.getForums(token);
  }

  @Get('foros/:id')
  @ApiOperation({ summary: 'Obtener un foro por ID' })
  async getForumById(@Req() req: any, @Param('id') id: string) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.comunidadService.getForumById(id, token);
  }

  @Get('foros/:id/comentarios')
  @ApiOperation({ summary: 'Obtener comentarios de un foro' })
  async getComments(@Req() req: any, @Param('id') id: string) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.comunidadService.getCommentsByForumId(id, token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('foros')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo foro' })
  async createForum(
    @Req() req: any,
    @Body('titulo') titulo: string,
    @Body('descripcion') descripcion: string,
    @Body('categoria') categoria: string,
    @Body('imagenUrl') imagenUrl?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.createForum(userId, titulo, descripcion, categoria, imagenUrl);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir una imagen para un foro o comentario' })
  async uploadImage(
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(png|jpeg|jpg|webp)',
          fallbackToMimetype: true,
        })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 + 1 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.uploadImage(userId, file);
  }


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('foros/:id')
  @ApiOperation({ summary: 'Actualizar un foro existente' })
  async updateForum(
    @Req() req: any,
    @Param('id') id: string,
    @Body('titulo') titulo?: string,
    @Body('descripcion') descripcion?: string,
    @Body('categoria') categoria?: string,
    @Body('imagenUrl') imagenUrl?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.updateForum(userId, id, { titulo, descripcion, categoria, imagenUrl });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('foros/:id')
  @ApiOperation({ summary: 'Eliminar un foro' })
  async deleteForum(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.deleteForum(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('foros/:id/comentarios')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Añadir un comentario a un foro' })
  async addComment(
    @Req() req: any,
    @Param('id') forumId: string,
    @Body('contenido') contenido: string,
    @Body('parentId') parentId?: string,
    @Body('imagenUrl') imagenUrl?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.addComment(userId, forumId, contenido, parentId, imagenUrl);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('comentarios/:id')
  @ApiOperation({ summary: 'Actualizar un comentario' })
  async updateComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body('contenido') contenido: string,
    @Body('imagenUrl') imagenUrl?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.updateComment(userId, id, contenido, imagenUrl);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('comentarios/:id')
  @ApiOperation({ summary: 'Eliminar un comentario' })
  async deleteComment(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.deleteComment(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':targetType/:id/reacciones')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Añadir reacción (targetType: comentario | articulo | foro)' })
  async addReaction(
    @Req() req: any,
    @Param('targetType') targetType: 'comentario' | 'articulo' | 'foro',
    @Param('id') targetId: string,
    @Body('tipo') tipo: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.addReaction(userId, targetType, targetId, tipo);
  }

  // ================= Retos =================
  @Get('retos')
  @ApiOperation({ summary: 'Obtener retos disponibles' })
  async getRetos(@Req() req: any) {
    const token = req.headers?.authorization?.split(' ')[1];
    return this.comunidadService.getRetos(token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('retos/:id/unirse')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Unirse a un reto' })
  async joinReto(
    @Req() req: any,
    @Param('id') retoId: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.joinReto(userId, retoId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('retos/:id/salir')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Salir o abandonar un reto' })
  async leaveReto(
    @Req() req: any,
    @Param('id') retoId: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.leaveReto(userId, retoId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('retos/:id/checkin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar avance diario o check-in en un reto' })
  async checkinReto(
    @Req() req: any,
    @Param('id') retoId: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.checkinReto(userId, retoId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('retos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo reto en la comunidad' })
  async createReto(
    @Req() req: any,
    @Body() dto: {
      titulo: string;
      descripcion: string;
      puntosRecompensa?: number;
      fechaInicio?: string;
      fechaFin?: string;
      insigniaRecompensa?: string;
      icono?: string;
      diasObjetivo?: number;
    },
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.createReto(userId, dto);
  }

  // ================= Especialistas =================
  @Get('especialistas')
  @ApiOperation({ summary: 'Obtener directorio de especialistas (Entrenadores)' })
  async getEspecialistas() {
    return this.comunidadService.getEspecialistas();
  }

  // ================= Artículos =================
  @Get('articulos')
  @ApiOperation({ summary: 'Obtener artículos publicados' })
  async getArticulos() {
    return this.comunidadService.getArticulos();
  }

  // ================= Hábitos Comunitarios =================
  @Get('habitos')
  @ApiOperation({ summary: 'Obtener hábitos compartidos en la comunidad' })
  async getCommunityHabits() {
    return this.comunidadService.getCommunityHabits();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('habitos/:id/clonar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Clonar un hábito a tu cuenta' })
  async cloneHabit(
    @Req() req: any,
    @Param('id') idhabito: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.cloneHabit(userId, idhabito);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('habitos/:id/compartir')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Compartir tu hábito con la comunidad' })
  async shareHabit(
    @Req() req: any,
    @Param('id') idhabito: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.shareHabit(userId, idhabito);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('habitos/:id')
  @ApiOperation({ summary: 'Eliminar un hábito compartido de la comunidad' })
  async deleteSharedHabit(
    @Req() req: any,
    @Param('id') idhabito: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('No autenticado');
    return this.comunidadService.deleteSharedHabit(userId, idhabito);
  }
}
