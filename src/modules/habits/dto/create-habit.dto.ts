import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHabitDto {
  @ApiProperty({ description: 'Nombre del hábito', example: 'Correr 5km' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción del hábito' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({
    description: 'Fecha de inicio (YYYY-MM-DD)',
    example: '2026-08-20',
  })
  @IsDateString()
  fechaInicio: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiProperty({
    description: 'Puntos que otorga el hábito (1-100)',
    example: 10,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  puntos: number;

  @ApiPropertyOptional({ description: 'Meta diaria numérica', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  metaDiaria?: number;

  @ApiPropertyOptional({ description: 'Unidad de medida', example: 'veces' })
  @IsOptional()
  @IsString()
  unidadMedida?: string;

  @ApiProperty({ description: 'UUID de la categoría del hábito' })
  @IsUUID()
  idCategoria: string;

  @ApiPropertyOptional({
    description: 'Días de la semana en los que aplica el hábito (1=Lunes, 7=Domingo)',
    example: [1, 2, 3, 4, 5, 6, 7],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  diasSemana?: number[];

  @ApiPropertyOptional({
    description: 'Lista de horas de recordatorios (HH:MM)',
    example: ['08:00', '20:00'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recordatorios?: string[];
}
