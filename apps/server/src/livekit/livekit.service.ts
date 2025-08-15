import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

export interface RoomOptions {
  maxParticipants?: number;
  emptyTimeout?: number;
  maxPublishers?: number;
}

@Injectable()
export class LiveKitService {
  private roomService: RoomServiceClient;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_SECRET');
    const url = this.configService.get<string>('LIVEKIT_URL');

    if (!apiKey || !apiSecret || !url) {
      throw new Error('LiveKit configuration is missing');
    }

    this.roomService = new RoomServiceClient(url, apiKey, apiSecret);
  }

  async createRoom(roomName: string, options: RoomOptions = {}) {
    const {
      maxParticipants = 50,
      emptyTimeout = 10 * 60, // 10 minutes
      maxPublishers = 10,
    } = options;

    try {
      const room = await this.roomService.createRoom({
        name: roomName,
        maxParticipants,
        emptyTimeout,
        maxPublishers,
        metadata: JSON.stringify({
          createdAt: new Date().toISOString(),
        }),
      });

      return {
        name: room.name,
        url: this.configService.get<string>('LIVEKIT_URL'),
        maxParticipants: room.maxParticipants,
        emptyTimeout: room.emptyTimeout,
        maxPublishers: room.maxPublishers,
      };
    } catch (error) {
      throw new Error(`Failed to create LiveKit room: ${error.message}`);
    }
  }

  async generateToken(roomName: string, participantIdentity: string, participantName?: string) {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_SECRET');

    if (!apiKey || !apiSecret) {
      throw new Error('LiveKit API credentials are missing');
    }

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
  }

  async deleteRoom(roomName: string) {
    try {
      await this.roomService.deleteRoom(roomName);
    } catch (error) {
      console.error(`Failed to delete LiveKit room ${roomName}:`, error);
    }
  }

  async getRoom(roomName: string) {
    try {
      return await this.roomService.getRoom(roomName);
    } catch (error) {
      throw new Error(`Failed to get LiveKit room: ${error.message}`);
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

