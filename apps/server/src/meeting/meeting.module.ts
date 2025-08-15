import { Module } from '@nestjs/common';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { LiveKitModule } from '../livekit/livekit.module';

@Module({
  imports: [AuthModule, LiveKitModule],
  controllers: [MeetingController],
  providers: [MeetingService, PrismaService],
})
export class MeetingModule {}
