import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { JoinMeetingDto } from './dto/join-meeting.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Meetings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'User meetings retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getUserMeetings(@Req() req: any) {
    const userId = req.user.userId;
    return this.meetingService.getUserMeetings(userId);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Meeting retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Meeting not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getMeeting(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.meetingService.getMeeting(id, userId);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Meeting successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  createMeeting(@Req() req: any, @Body() createMeetingDto: CreateMeetingDto) {
    const userId = req.user.userId;
    return this.meetingService.createMeeting(createMeetingDto, userId);
  }

  @Post('join')
  @ApiResponse({ status: 200, description: 'Successfully joined the meeting.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Meeting not found.' })
  joinMeeting(@Req() req: any, @Body() joinMeetingDto: JoinMeetingDto) {
    const userId = req.user.userId;
    return this.meetingService.joinMeeting(joinMeetingDto, userId);
  }

  @Put(':id/end')
  @ApiResponse({ status: 200, description: 'Meeting ended successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Meeting not found.' })
  endMeeting(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.meetingService.endMeeting(id, userId);
  }

  @Put('leave')
  @ApiResponse({ status: 200, description: 'Successfully left the meeting.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'Meeting or participant not found.',
  })
  leaveMeeting(@Req() req: any, @Body() joinMeetingDto: JoinMeetingDto) {
    const userId = req.user.userId;
    return this.meetingService.leaveMeeting(joinMeetingDto.meetingId, userId);
  }
}
