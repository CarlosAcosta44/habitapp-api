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
}
