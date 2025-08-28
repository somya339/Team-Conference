# NexusMeet - Production Deployment Guide

This guide provides instructions for deploying the NexusMeet video conferencing application to a production environment.

## 🚀 Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 8.x (package manager)
- **PostgreSQL** 14+ database
- **LiveKit** server (self-hosted or cloud)
- Domain name with SSL certificates (Let's Encrypt recommended)
- Server with at least:
  - 2 vCPUs
  - 4GB RAM (8GB recommended for production)
  - 20GB SSD storage

## Environment Variables
VITE_LIVEKIT_URL=wss://livekit.nexusmeet.app

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME="NexusMeet"
NEXT_PUBLIC_APP_URL=https://nexusmeet.app

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

### Server Application (`apps/server/.env.production`)

```bash
# ===== Database =====
DATABASE_URL=postgresql://user:password@host:5432/nexusmeet?schema=public

# ===== Authentication =====
JWT_SECRET=generate-a-secure-secret-here
JWT_REFRESH_SECRET=generate-a-secure-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ===== LiveKit Configuration =====
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_SECRET=your-livekit-secret
LIVEKIT_URL=wss://livekit.nexusmeet.app

# ===== Application Settings =====
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://nexusmeet.app
CORS_ORIGINS=https://nexusmeet.app,https://www.nexusmeet.app

# ===== Rate Limiting =====
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100  # Max requests per window per IP

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## Building for Production

### Web Application

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the application:
   ```bash
   cd apps/web
   pnpm build:prod
   ```

3. The production build will be available in the `dist` directory.

### Server Application

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the application:
   ```bash
   cd apps/server
   pnpm build
   ```

3. The production build will be available in the `dist` directory.

## Deployment

### Web Application

You can deploy the web application to any static hosting service like:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Nginx

### Server Application

The server application should be deployed to a Node.js capable server. Recommended options:
- PM2
- Docker
- Kubernetes
- AWS ECS/EKS

## Database Setup

1. Create a PostgreSQL database
2. Run migrations:
   ```bash
   cd apps/server
   pnpm prisma migrate deploy
   ```

## SSL Configuration

Ensure you have SSL certificates set up for both the API and Web domains. You can use Let's Encrypt for free certificates.

## Monitoring and Logging

- Set up error tracking (Sentry, Datadog, etc.)
- Configure logging to a centralized service
- Set up monitoring and alerts

## Backups

- Set up regular database backups
- Backup any file uploads if using local storage

## Security Considerations

- Keep dependencies up to date
- Regularly rotate secrets
- Implement rate limiting
- Set up a WAF (Web Application Firewall)
- Enable security headers

## Scaling

- Use a load balancer for the API
- Consider using a CDN for static assets
- Scale database resources as needed
- Implement caching where appropriate
