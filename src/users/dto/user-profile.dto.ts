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
  @ApiPropertyOptional({
    example: 'Carlos',
    description: 'Primer nombre del usuario (máx. 45 caracteres).',
  })
  @IsString()
  @IsOptional()
  @MaxLength(45)
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Acosta',
    description: 'Apellido del usuario (máx. 45 caracteres).',
  })
  @IsString()
  @IsOptional()
  @MaxLength(45)
  apellido?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    description: 'URL pública de la foto de perfil (máx. 200 caracteres).',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  fotoperfil?: string;
}

export class UserProfileDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del usuario generado por Supabase Auth.',
  })
  idusuario: string;

  @ApiProperty({ example: 'Carlos', description: 'Nombre del usuario.' })
  nombre: string;

  @ApiProperty({ example: 'Acosta', description: 'Apellido del usuario.' })
  apellido: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    description: 'URL de la foto de perfil. Puede ser null si no se configuró.',
  })
  fotoperfil: string | null;

  @ApiProperty({
    example: 120,
    description: 'Puntos totales acumulados por el usuario en la aplicación.',
  })
  puntostotales: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'UUID del rol asignado al usuario en la tabla gestion.roles.',
  })
  idrol: string;

  @ApiProperty({
    enum: RoleName,
    example: RoleName.USER,
    description: 'Nombre legible del rol: Usuario, Entrenador o Administrador.',
  })
  nombrerol: string;
}
