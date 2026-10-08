import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ReportsService } from '../services/reports.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/common/guards/jwt-auth.guard';
import { RankingEntryDto, UserSummaryDto, HabitProgressDto } from '../dto/reports.dto';

@ApiTags('reports')
@ApiBearerAuth('supabase-jwt')
@UseGuards(JwtAuthGuard)
@Controller('reports')
@UseInterceptors(CacheInterceptor)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('ranking')
  @CacheKey('ranking_usuarios')
  @CacheTTL(60000) // 60 segundos
  @ApiOperation({
    summary: 'Obtener el ranking de usuarios activos (Top 100)',
    description: 'Retorna los 100 usuarios con mayor puntaje total. Resultado cacheado por 60s.',
  })
  @ApiResponse({ status: 200, description: 'Ranking obtenido exitosamente.', type: [RankingEntryDto] })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  async getRanking() {
    return this.reportsService.getRanking();
  }

  @Get('user/:userId')
  @CacheTTL(30000) // 30 segundos
  @ApiOperation({
    summary: 'Obtener el resumen consolidado de un usuario',
    description: 'Calcula rachas, cumplimiento global, volumen semanal y consistencia mensual para el período indicado.',
  })
  @ApiParam({ name: 'userId', type: String, description: 'UUID del usuario' })
  @ApiQuery({ name: 'period', enum: ['week', 'month', 'year'], required: false, description: 'Período de análisis (default: week)' })
  @ApiResponse({ status: 200, description: 'Resumen obtenido exitosamente.', type: UserSummaryDto })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  @ApiResponse({ status: 500, description: 'Error al procesar el resumen.' })
  async getUserSummary(
    @Param('userId') userId: string,
    @Query('period') period?: 'week' | 'month' | 'year',
  ) {
    return this.reportsService.getUserSummary(userId, period);
  }

  @Get('user/:userId/habits')
  @CacheTTL(30000)
  @ApiOperation({
    summary: 'Obtener reporte de hábitos activos de un usuario',
    description: 'Retorna la lista de hábitos activos con su progreso actual.',
  })
  @ApiParam({ name: 'userId', type: String, description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Reporte de hábitos obtenido exitosamente.', type: [HabitProgressDto] })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  async getUserHabits(@Param('userId') userId: string) {
    return this.reportsService.getHabitsReport(userId);
  }

  @Get('user/:userId/comparative')
  @CacheTTL(30000)
  @ApiOperation({
    summary: 'Obtener reporte comparativo de categorías de un usuario',
    description: 'Retorna datos de cumplimiento por categoría (salud, enfoque, etc.) para graficar en el frontend.',
  })
  @ApiParam({ name: 'userId', type: String, description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Reporte comparativo obtenido exitosamente.' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  async getUserComparative() {
    return this.reportsService.getComparativeReport();
  }
}

