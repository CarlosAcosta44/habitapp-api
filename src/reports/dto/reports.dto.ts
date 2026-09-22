import { ApiProperty } from '@nestjs/swagger';

/**
 * Reports DTOs
 * Contratos de respuesta de los endpoints del módulo Reports.
 * Tipados y documentados con Swagger.
 */

export class RankingEntryDto {
  @ApiProperty({ description: 'ID del usuario' })
  idusuario: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  nombre: string;

  @ApiProperty({ description: 'Apellido del usuario' })
  apellido?: string;

  @ApiProperty({ description: 'Puntos totales acumulados' })
  puntostotales: number;

  @ApiProperty({ description: 'Posición en el ranking' })
  posicion?: number;
}

export class HabitProgressDto {
  @ApiProperty({ description: 'ID del hábito' })
  idHabito: string;

  @ApiProperty({ description: 'Nombre del hábito' })
  nombre: string;

  @ApiProperty({ description: 'Porcentaje de cambio (ej: +5%)' })
  porcentajeCambio: string;

  @ApiProperty({ description: 'Descripción del hábito' })
  descripcion: string;

  @ApiProperty({ description: 'Progreso actual (0-100)' })
  progreso: number;

  @ApiProperty({ description: 'Color del hábito (clases CSS o hex)' })
  color: string;
}

export class UserSummaryDto {
  @ApiProperty({ description: 'ID del usuario' })
  userId: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  nombre?: string;

  @ApiProperty({ description: 'Puntos totales acumulados' })
  puntos_totales: number;

  @ApiProperty({ description: 'Porcentaje de cumplimiento global en el período' })
  cumplimiento_global: number;

  @ApiProperty({ description: 'Total de ocurrencias esperadas en el período' })
  total_esperado: number;

  @ApiProperty({ description: 'Total de ocurrencias completadas en el período' })
  total_cumplido: number;

  @ApiProperty({ description: 'Racha actual (días consecutivos completos)' })
  racha_actual: number;

  @ApiProperty({ description: 'Racha máxima histórica' })
  racha_maxima: number;

  @ApiProperty({ description: 'Hábito con mejor cumplimiento', nullable: true })
  mas_constante?: { nombre: string; racha: number; rate: number };

  @ApiProperty({ description: 'Hábito con menor cumplimiento (oportunidad de mejora)', nullable: true })
  oportunidad_mejora?: { nombre: string; rate: number };

  @ApiProperty({ description: 'Volumen semanal [Lun, Mar, Mié, Jue, Vie, Sáb, Dom]', type: [Number] })
  volumen_semanal: number[];

  @ApiProperty({ description: 'Consistencia de los últimos 30 días', type: [Object] })
  consistencia_mes: { fecha: string; activos: number }[];

  @ApiProperty({ description: 'Mensaje de insight personalizado' })
  insight: string;
}
