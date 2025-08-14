import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LiveKitService } from '../livekit/livekit.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { JoinMeetingDto } from './dto/join-meeting.dto';

@Injectable()
export class MeetingService {
  constructor(
    private prisma: PrismaService,
    private livekitService: LiveKitService,
  ) {}

  async createMeeting(createMeetingDto: CreateMeetingDto, userId: number) {
    const { title, description, startTime, endTime, maxParticipants } = createMeetingDto;

    // Validate meeting time
    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      throw new BadRequestException('End time must be after start time');
    }

    // Create meeting in database
    const meeting = await this.prisma.meeting.create({
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        maxParticipants: maxParticipants || 50,
        createdBy: userId,
        status: 'scheduled',
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create LiveKit room
    const roomName = `meeting_${meeting.id}`;
    const room = await this.livekitService.createRoom(roomName, {
      maxParticipants: meeting.maxParticipants,
      emptyTimeout: 10 * 60, // 10 minutes
      maxPublishers: 10,
    });

    // Update meeting with room information
    const updatedMeeting = await this.prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        roomName: room.name,
        roomUrl: room.url,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedMeeting;
  }

  async joinMeeting(joinMeetingDto: JoinMeetingDto, userId: number) {
    const { meetingId } = joinMeetingDto;

    // Find meeting
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // Check if meeting is active
    if (meeting.status === 'ended') {
      throw new BadRequestException('Meeting has ended');
    }

    // Check participant limit
    if (meeting.participants.length >= meeting.maxParticipants) {
      throw new BadRequestException('Meeting is full');
    }

    // Add participant if not already in meeting
    let participant = meeting.participants.find(p => p.userId === userId);
    if (!participant) {
      participant = await this.prisma.meetingParticipant.create({
        data: {
          meetingId: meeting.id,
          userId,
          joinedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    // Generate access token for LiveKit
    const token = await this.livekitService.generateToken(meeting.roomName, userId.toString());

    return {
      meeting,
      participant,
      token,
      roomUrl: meeting.roomUrl,
    };
  }

  async getMeeting(meetingId: number, userId: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // Check if user is participant or creator
    const isParticipant = meeting.participants.some(p => p.userId === userId);
    const isCreator = meeting.createdBy === userId;

    if (!isParticipant && !isCreator) {
      throw new BadRequestException('You are not authorized to view this meeting');
    }

    return meeting;
  }

  async getUserMeetings(userId: number) {
    const meetings = await this.prisma.meeting.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { participants: { some: { userId } } },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return meetings;
  }

  async endMeeting(meetingId: number, userId: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    if (meeting.createdBy !== userId) {
      throw new BadRequestException('Only the meeting creator can end the meeting');
    }

    // Update meeting status
    const updatedMeeting = await this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: 'ended',
        endedAt: new Date(),
      },
    });

    // Close LiveKit room
    await this.livekitService.deleteRoom(meeting.roomName);

    return updatedMeeting;
  }

  async leaveMeeting(meetingId: number, userId: number) {
    const participant = await this.prisma.meetingParticipant.findFirst({
      where: {
        meetingId,
        userId,
      },
    });

    if (!participant) {
      throw new NotFoundException('You are not a participant of this meeting');
    }

    await this.prisma.meetingParticipant.update({
      where: { id: participant.id },
      data: {
        leftAt: new Date(),
      },
    });

    return { message: 'Successfully left the meeting' };
  }
}
