import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export enum HabitFrequency {
  DIARIA = 'diaria',
  SEMANAL = 'semanal',
  PERSONALIZADA = 'personalizada',
}

export class CreateRoutineHabitDto {
  @ApiProperty({ description: 'Nombre del hábito' })
  @IsString()
  @IsNotEmpty()
  habit_name: string;

  @ApiProperty({
    description: 'Icono del hábito (emoji)',
    default: '⭐',
    required: false,
  })
  @IsString()
  @IsOptional()
  habit_icon?: string;

  @ApiProperty({
    description: 'Frecuencia del hábito',
    enum: HabitFrequency,
    default: HabitFrequency.DIARIA,
    required: false,
  })
  @IsEnum(HabitFrequency)
  @IsOptional()
  frequency?: HabitFrequency;

  @ApiProperty({
    description: 'Orden en la rutina',
    default: 0,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order_index?: number;
}

export class CreateRoutineDto {
  @ApiProperty({ description: 'Nombre de la rutina' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descripción de la rutina', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Hábitos incluidos en la rutina',
    type: [CreateRoutineHabitDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRoutineHabitDto)
  @IsOptional()
  habits?: CreateRoutineHabitDto[];
}
