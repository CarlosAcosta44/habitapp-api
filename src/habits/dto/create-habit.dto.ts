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
}
