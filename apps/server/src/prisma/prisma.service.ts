import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly databaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || configService.get<string>('database.url')
        }
      },
      log: ['error', 'warn'],
      errorFormat: 'pretty'
    });
    
    this.databaseUrl = process.env.DATABASE_URL || configService.get<string>('database.url');
    
    if (!this.databaseUrl) {
      this.logger.error('DATABASE_URL is not defined in environment variables or configuration');
      throw new Error('Database connection URL is not configured');
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
