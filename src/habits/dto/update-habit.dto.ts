import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
  IsIn,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateHabitDto {
  @ApiPropertyOptional({ description: 'Nombre del hábito' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ description: 'Descripción del hábito' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Estado del hábito',
    enum: ['Activo', 'Completado', 'Cancelado'],
  })
  @IsOptional()
  @IsIn(['Activo', 'Completado', 'Cancelado'])
  estado?: string;

  @ApiPropertyOptional({ description: 'Puntos que otorga el hábito (1-100)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  puntos?: number;

  @ApiPropertyOptional({ description: 'UUID de la categoría' })
  @IsOptional()
  @IsUUID()
  idCategoria?: string;

  @ApiPropertyOptional({
    description: 'Días de la semana en los que aplica el hábito (1=Lunes, 7=Domingo)',
    example: [1, 2, 3, 4, 5, 6, 7],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  diasSemana?: number[];
}
