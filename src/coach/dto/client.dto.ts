import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto } from '../../users/dto/user-profile.dto';

export class ClientDto {
  @ApiProperty()
  assigned_at: Date;

  @ApiProperty({ type: UserProfileDto })
  client: UserProfileDto;
}
