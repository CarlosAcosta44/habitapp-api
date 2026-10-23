import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
export class AddFriendDto {
  @ApiProperty({ description: 'UUID del usuario a agregar como amigo' })
  @IsUUID()
  targetUserId: string;
}
