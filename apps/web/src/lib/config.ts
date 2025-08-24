export const config = {
  serverUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  livekitUrl: import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880',
  appName: 'Stellar Conferencing',
  version: '1.0.0',
  features: {
    recording: true,
    screenSharing: true,
    chat: true,
    fileSharing: false, // TODO: Implement file sharing feature
  },
  limits: {
    maxParticipants: 50,
    maxMeetingDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  ui: {
    theme: 'light' as const,
    language: 'en' as const,
    autoJoinAudio: false,
    autoJoinVideo: false,
  },
} as const;

export type Config = typeof config;
