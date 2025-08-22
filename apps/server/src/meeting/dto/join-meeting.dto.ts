import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class JoinMeetingDto {
  @ApiProperty({
    description: 'Unique meeting code or ID',
    example: 'abcxyz123',
  })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  meetingId: string;
}
