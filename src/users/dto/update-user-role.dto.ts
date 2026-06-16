import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RoleName } from './user-profile.dto';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: RoleName,
    example: RoleName.TRAINER,
    description: 'Nombre del rol en gestion.roles',
  })
  @IsEnum(RoleName)
  nombrerol: RoleName;
}
