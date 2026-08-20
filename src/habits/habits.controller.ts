import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HabitsService } from './services/habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@ApiTags('habits')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard: hábitos activos con progreso de hoy' })
  getDashboard(@Req() req: any) {
    return this.habitsService.getDashboard(req.user.idusuario as string);
  }

  @Get('categorias')
  @ApiOperation({ summary: 'Obtener todas las categorías de hábitos' })
  getCategorias() {
    return this.habitsService.getCategorias();
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los hábitos del usuario' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado' })
  findAll(@Req() req: any, @Query('estado') estado?: string) {
    return this.habitsService.findAll(req.user.idusuario as string, estado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un hábito por ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.habitsService.findById(id, req.user.idusuario as string);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo hábito' })
  @ApiResponse({ status: 201, description: 'Hábito creado.' })
  create(@Body() dto: CreateHabitDto, @Req() req: any) {
    return this.habitsService.create(dto, req.user.idusuario as string);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un hábito' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHabitDto,
    @Req() req: any,
  ) {
    return this.habitsService.update(id, dto, req.user.idusuario as string);
  }

  @Patch(':id/completar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar un hábito como Completado' })
  completar(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.habitsService.completar(id, req.user.idusuario as string);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un hábito (y sus registros)' })
  delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.habitsService.delete(id, req.user.idusuario as string);
  }
}
