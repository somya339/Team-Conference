# Stellar Conferencing - Production Deployment Guide

This guide provides instructions for deploying the Stellar Conferencing application to a production environment.

## Prerequisites

- Node.js 18+ and pnpm installed
- PostgreSQL database
- LiveKit server
- Domain name with SSL certificates
- Server with at least 2GB RAM and 2 vCPUs

## Environment Variables

### Web Application

Create a `.env.production` file in the `apps/web` directory:

```bash
VITE_API_URL=https://api.yourdomain.com/api
VITE_LIVEKIT_URL=wss://livekit.yourdomain.com
NODE_ENV=production
```

### Server Application

Create a `.env.production` file in the `apps/server` directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# JWT
JWT_SECRET=your-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-secure-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# LiveKit
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_SECRET=your-livekit-secret
LIVEKIT_URL=wss://livekit.yourdomain.com

# App
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

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
