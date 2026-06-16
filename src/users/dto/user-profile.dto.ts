import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export enum UserRole {
  USER = 'usuario',
  TRAINER = 'entrenador',
  ADMIN = 'administrador',
}

export enum RoleName {
  USER = 'Usuario',
  TRAINER = 'Entrenador',
  ADMIN = 'Administrador',
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: 'Carlos' })
  @IsString()
  @IsOptional()
  @MaxLength(45)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Acosta' })
  @IsString()
  @IsOptional()
  @MaxLength(45)
  apellido?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  fotoperfil?: string;
}

export class UserProfileDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  idusuario: string;

  @ApiProperty({ example: 'Carlos' })
  nombre: string;

  @ApiProperty({ example: 'Acosta' })
  apellido: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  fotoperfil: string | null;

  @ApiProperty({ example: 120 })
  puntostotales: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  idrol: string;

  @ApiProperty({ enum: RoleName, example: RoleName.USER })
  nombrerol: string;
}
