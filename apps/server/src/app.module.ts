import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MeetingModule } from './meeting/meeting.module';
import { SubmissionModule } from './submission/submission.module';
import { LiveKitModule } from './livekit/livekit.module';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    MeetingModule,
    SubmissionModule,
    LiveKitModule,
  ],
  providers: [],
})
export class AppModule {}
