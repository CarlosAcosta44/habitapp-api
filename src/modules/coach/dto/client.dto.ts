import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto } from '../../users/dto/user-profile.dto';

export class ClientDto {
  @ApiProperty({
    example: '2026-06-01T10:00:00.000Z',
    description: 'Fecha y hora en que el cliente fue asignado al entrenador.',
  })
  assigned_at: Date;

  @ApiProperty({
    type: UserProfileDto,
    description: 'Perfil completo del usuario asignado como cliente.',
  })
  client: UserProfileDto;
}
