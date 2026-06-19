import { Controller, Get, UseInterceptors } from '@nestjs/common';
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
}
