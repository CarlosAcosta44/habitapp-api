import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { RoleName } from './user-profile.dto';

export class UpdateUserRoleDto {
  @ApiPropertyOptional({
    enum: RoleName,
    example: RoleName.TRAINER,
    description: 'Nombre del rol en gestion.roles',
  })
  @IsOptional()
  nombrerol?: RoleName | string;

  @ApiPropertyOptional({
    description: 'Alias alternativo para el rol',
  })
  @IsOptional()
  @IsString()
  role?: string;
}
