import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Verificar estado de la API',
    description: 'Endpoint público que confirma que el servidor está en línea.',
  })
  @ApiResponse({
    status: 200,
    description: 'La API está operativa.',
    schema: {
      example: { status: 'ok', timestamp: '2026-06-16T12:00:00.000Z' },
    },
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('debug-sentry')
  @ApiOperation({
    summary: 'Probar integración de Sentry',
    description:
      'Lanza un error intencional para verificar la captura en Sentry.',
  })
  @ApiResponse({ status: 500, description: 'Error intencional lanzado.' })
  debugSentry() {
    throw new Error('Sentry Backend Integration Test Error');
  }
}
