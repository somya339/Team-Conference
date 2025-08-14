import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface LiveKitConfig {
  apiKey: string;
  secret: string;
  url: string;
}

export interface AppConfig {
  port: number;
  environment: string;
  frontendUrl: string;
  corsOrigins: string[];
}

export interface SecurityConfig {
  bcryptRounds: number;
  rateLimitWindow: number;
  rateLimitMax: number;
}

export interface FileUploadConfig {
  maxSize: number;
  allowedMimeTypes: string[];
  uploadPath: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export default registerAs('app', () => ({
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  } as DatabaseConfig,

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  } as JwtConfig,

  livekit: {
    apiKey: process.env.LIVEKIT_API_KEY || 'devkey',
    secret: process.env.LIVEKIT_SECRET || 'secret',
    url: process.env.LIVEKIT_URL || 'ws://localhost:7880',
  } as LiveKitConfig,

  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  } as AppConfig,

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  } as SecurityConfig,

  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  } as FileUploadConfig,

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
    },
    from: process.env.EMAIL_FROM || 'noreply@stellar-conferencing.com',
  } as EmailConfig,
}));
