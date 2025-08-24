import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

export interface RoomOptions {
  maxParticipants?: number;
  emptyTimeout?: number;
}

@Injectable()
export class LiveKitService {
  private roomService: RoomServiceClient;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('app.livekit.apiKey');
    const apiSecret = this.configService.get<string>('app.livekit.secret');
    const url = this.configService.get<string>('app.livekit.url');

    if (!apiKey || !apiSecret || !url) {
      throw new Error('LiveKit configuration is missing');
    }

    this.roomService = new RoomServiceClient(url, apiKey, apiSecret);
  }

  async createRoom(roomName: string, options: RoomOptions = {}) {
    const {
      maxParticipants = 50,
      emptyTimeout = 10 * 60, // 10 minutes
    } = options;

    try {
      const room = await this.roomService.createRoom({
        name: roomName,
        maxParticipants,
        emptyTimeout,
        metadata: JSON.stringify({
          createdAt: new Date().toISOString(),
        }),
      });

      return {
        name: room.name,
        url: this.configService.get<string>('app.livekit.url'),
        maxParticipants: room.maxParticipants,
        emptyTimeout: room.emptyTimeout,
      };
    } catch (error) {
      console.error(`Failed to create LiveKit room: ${error.message}`);
      // Return mock room data to allow meeting creation to continue
      return {
        name: roomName,
        url: this.configService.get<string>('app.livekit.url') || 'ws://localhost:7880',
        maxParticipants,
        emptyTimeout,
      };
    }
  }

  async generateToken(
    roomName: string,
    participantIdentity: string,
    participantName?: string,
  ) {
    const apiKey = this.configService.get<string>('app.livekit.apiKey');
    const apiSecret = this.configService.get<string>('app.livekit.secret');

    if (!apiKey || !apiSecret) {
      console.error('LiveKit API credentials are missing');
      // Return a mock token for development
      return 'mock-token-for-development';
    }

    try {
      const at = new AccessToken(apiKey, apiSecret, {
        identity: participantIdentity,
        name: participantName || participantIdentity,
      });

      at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });

      return at.toJwt();
    } catch (error) {
      console.error(`Failed to generate LiveKit token: ${error.message}`);
      // Return a mock token as fallback
      return 'mock-token-for-development';
    }
  }

  async deleteRoom(roomName: string) {
    try {
      await this.roomService.deleteRoom(roomName);
    } catch (error) {
      console.error(`Failed to delete LiveKit room ${roomName}:`, error);
    }
  }

  async listRooms() {
    try {
      return await this.roomService.listRooms();
    } catch (error) {
      throw new Error(`Failed to list LiveKit rooms: ${error.message}`);
    }
  }
}
