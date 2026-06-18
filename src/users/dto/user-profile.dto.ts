import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export enum UserRole {
  USER = 'usuario',
  TRAINER = 'entrenador',
  ADMIN = 'administrador',
}

export class UpdateUserProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  full_name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatar_url?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  timezone?: string;
}

export class UserProfileDto {
  idusuario: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  genero: string | null;
  fechanacimiento: string | null;
  fotoperfil: string | null;
  estado: string;
  puntostotales: number;
  idrol: string;
}

export class UserPointsDto {
  idusuario: string;
  puntostotales: number;
}
