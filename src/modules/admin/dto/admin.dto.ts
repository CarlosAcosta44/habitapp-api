import { ApiProperty } from '@nestjs/swagger';

/**
 * Admin DTOs
 * Definen los contratos de entrada y salida de los endpoints del módulo Admin.
 * Documentados con Swagger para visibilidad en la UI de la API.
 */

export class DeleteForumResponseDto {
  @ApiProperty({
    example: 'Forum and its comments deleted successfully',
    description: 'Mensaje de confirmación del borrado',
  })
  message: string;
}

export class DeleteCommentResponseDto {
  @ApiProperty({
    example: 'Comment deleted successfully',
    description: 'Mensaje de confirmación del borrado',
  })
  message: string;
}

export class DailyQuoteDto {
  @ApiProperty({
    example: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.',
    description: 'Frase motivacional del día',
  })
  phrase?: string;

  @ApiProperty({
    example: 'Robert Collier',
    description: 'Autor de la frase',
  })
  author?: string;
}
