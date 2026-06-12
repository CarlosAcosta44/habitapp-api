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
  @ApiProperty()
  id: string;

  @ApiProperty()
  full_name: string;

  @ApiProperty()
  avatar_url: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  total_points: number;

  @ApiProperty()
  created_at: Date;
}
