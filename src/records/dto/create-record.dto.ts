import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddFriendDto {
  @ApiProperty({ description: 'UUID del usuario a agregar como amigo' })
  @IsUUID()
  targetUserId: string;
}

export class CreateRecordDto {
  @ApiProperty({ description: 'UUID del hábito' })
  @IsUUID()
  idHabito: string;

  @ApiPropertyOptional({ description: 'Observación del registro' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}

export class AvanzarProgresoDto {
  @ApiProperty({ description: 'UUID del hábito' })
  @IsUUID()
  idHabito: string;

  @ApiProperty({ description: 'Cantidad a sumar al progreso actual' })
  cantidadASumar: number;

  @ApiPropertyOptional({ description: 'Observación' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}
