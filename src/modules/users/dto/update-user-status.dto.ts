import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum UserAccountStatus {
  PENDING = 'Pendiente',
  ACTIVE = 'Activo',
  SUSPENDED = 'Suspendido',
}

export class UpdateUserStatusDto {
  @ApiProperty({
    enum: UserAccountStatus,
    example: UserAccountStatus.ACTIVE,
    description: 'Estado de la cuenta: Pendiente, Activo o Suspendido',
  })
  @IsEnum(UserAccountStatus, {
    message: 'El estado de cuenta debe ser Pendiente, Activo o Suspendido',
  })
  estado: UserAccountStatus;
}
