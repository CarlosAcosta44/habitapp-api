import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ReportsService } from '../services/reports.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('reports')
@Controller('reports')
@UseInterceptors(CacheInterceptor)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('ranking')
  @CacheKey('ranking_usuarios')
  @CacheTTL(60000) // 60 segundos
  @ApiOperation({ summary: 'Obtener el ranking de usuarios activos (Top 100)' })
  @ApiResponse({ status: 200, description: 'Ranking obtenido exitosamente.' })
  async getRanking() {
    return this.reportsService.getRanking();
  }

  @Get('user/:userId')
  @CacheTTL(30000) // 30 segundos de caché para el resumen del usuario
  @ApiOperation({ summary: 'Obtener el resumen consolidado de un usuario' })
  @ApiResponse({ status: 200, description: 'Resumen obtenido exitosamente.' })
  async getUserSummary(@Param('userId') userId: string) {
    return this.reportsService.getUserSummary(userId);
  }
  @Get('user/:userId/habits')
  @CacheTTL(30000)
  @ApiOperation({ summary: 'Obtener reporte de hábitos de un usuario' })
  @ApiResponse({ status: 200, description: 'Reporte de hábitos obtenido exitosamente.' })
  async getUserHabits(@Param('userId') userId: string) {
    return this.reportsService.getHabitsReport(userId);
  }

  @Get('user/:userId/comparative')
  @CacheTTL(30000)
  @ApiOperation({ summary: 'Obtener reporte comparativo de un usuario' })
  @ApiResponse({ status: 200, description: 'Reporte comparativo obtenido exitosamente.' })
  async getUserComparative(@Param('userId') userId: string) {
    return this.reportsService.getComparativeReport(userId);
  }
}
