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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/common/guards/jwt-auth.guard';
import { RecordsService } from '../services/records.service';
import { AvanzarProgresoDto, CreateRecordDto } from '../dto/create-record.dto';

@ApiTags('records')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get('historial')
  @ApiOperation({
    summary: 'Obtener historial completo de registros del usuario',
  })
  getHistorial(@Req() req: any) {
    return this.recordsService.getHistorial(req.user.userId as string);
  }

  @Get('habito/:habitoId')
  @ApiOperation({ summary: 'Obtener registros de un hábito específico' })
  getByHabito(
    @Param('habitoId', ParseUUIDPipe) habitoId: string,
    @Req() req: any,
  ) {
    return this.recordsService.getByHabito(
      habitoId,
      req.user.userId as string,
    );
  }

  private getTzOffset(req: any): number {
    const rawHeader = req.headers['x-timezone-offset'];
    return rawHeader ? Number.parseInt(rawHeader as string, 10) || 0 : 0;
  }

  @Get('racha/:habitoId')
  @ApiOperation({ summary: 'Obtener racha actual de un hábito' })
  getRacha(
    @Param('habitoId', ParseUUIDPipe) habitoId: string,
    @Req() req: any,
  ) {
    const tzOffset = this.getTzOffset(req);
    return this.recordsService.getRacha(habitoId, req.user.userId as string, tzOffset);
  }

  @Post('completar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar un hábito como completado hoy' })
  marcarCompletado(@Body() dto: CreateRecordDto, @Req() req: any) {
    const tzOffset = this.getTzOffset(req);
    return this.recordsService.marcarCompletado(
      dto,
      req.user.userId as string,
      tzOffset,
    );
  }

  @Delete('desmarcar/:habitoId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desmarcar un hábito completado hoy' })
  desmarcarCompletado(
    @Param('habitoId', ParseUUIDPipe) habitoId: string,
    @Req() req: any,
  ) {
    const tzOffset = this.getTzOffset(req);
    return this.recordsService.desmarcarCompletado(
      habitoId,
      req.user.userId as string,
      tzOffset,
    );
  }

  @Patch('progreso')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Avanzar progreso de un hábito hoy' })
  avanzarProgreso(@Body() dto: AvanzarProgresoDto, @Req() req: any) {
    const tzOffset = this.getTzOffset(req);
    return this.recordsService.avanzarProgreso(
      dto,
      req.user.userId as string,
      tzOffset,
    );
  }
}
