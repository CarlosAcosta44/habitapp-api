import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'Contenido del comentario' })
  @IsString()
  @IsNotEmpty()
  contenido: string;

  @ApiProperty({ description: 'ID del foro' })
  @IsUUID()
  @IsNotEmpty()
  idForo: string;

  @ApiPropertyOptional({
    description: 'ID del comentario padre (si es una respuesta)',
  })
  @IsUUID()
  @IsOptional()
  idComentarioPadre?: string;
}

export class ToggleReactionDto {
  @ApiProperty({
    description: 'Tipo de reacción',
    enum: ['Me gusta', 'Me motiva', 'Util'],
  })
  @IsString()
  @IsIn(['Me gusta', 'Me motiva', 'Util'])
  @IsNotEmpty()
  tipo: string;

  @ApiPropertyOptional({ description: 'ID del comentario a reaccionar' })
  @IsUUID()
  @IsOptional()
  idComentario?: string;

  @ApiPropertyOptional({ description: 'ID del artículo a reaccionar' })
  @IsUUID()
  @IsOptional()
  idArticulo?: string;
}
