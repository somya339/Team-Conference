# Environment Variables Documentation

This document lists all environment variables used in the NexusMeet application.

## Backend Environment Variables

Create a `.env` file in the `apps/server/` directory with the following variables:

### Database Configuration
```env
DATABASE_URL=file:./dev.db
```

### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### LiveKit Configuration
```env
LIVEKIT_API_KEY=devkey
LIVEKIT_SECRET=secret
LIVEKIT_URL=ws://localhost:7880
```

### Application Configuration
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Security Configuration
```env
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### File Upload Configuration
```env
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
UPLOAD_PATH=./uploads
```

### Email Configuration
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@nexusmeet.com
```

### Cloudinary Configuration (optional)
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Frontend Environment Variables

Create a `.env` file in the `apps/web/` directory with the following variables:

### API Configuration
```env
VITE_SERVER_URL=http://localhost:3000
```

### LiveKit Configuration
```env
VITE_LIVEKIT_URL=ws://localhost:7880
```

### Application Configuration
```env
VITE_APP_NAME=NexusMeet
VITE_APP_VERSION=1.0.0
```

### Feature Flags
```env
VITE_ENABLE_RECORDING=true
VITE_ENABLE_SCREEN_SHARING=true
VITE_ENABLE_CHAT=true
VITE_ENABLE_FILE_SHARING=false
```

### Limits Configuration
```env
VITE_MAX_PARTICIPANTS=50
VITE_MAX_MEETING_DURATION=86400000
VITE_MAX_FILE_SIZE=10485760
```

### UI Configuration
```env
VITE_THEME=light
VITE_LANGUAGE=en
VITE_AUTO_JOIN_AUDIO=false
VITE_AUTO_JOIN_VIDEO=false
```

### Analytics (optional)
```env
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### Development Configuration
```env
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
```

## Environment Variable Descriptions

### Backend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | SQLite database file path | `file:./dev.db` | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | `15m` | No |
| `JWT_REFRESH_EXPIRES_IN` | JWT refresh token expiration time | `7d` | No |
| `LIVEKIT_API_KEY` | LiveKit API key | `devkey` | Yes |
| `LIVEKIT_SECRET` | LiveKit secret key | `secret` | Yes |
| `LIVEKIT_URL` | LiveKit WebSocket URL | `ws://localhost:7880` | Yes |
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:5173` | Yes |
| `CORS_ORIGINS` | Comma-separated list of allowed CORS origins | `http://localhost:5173` | No |
| `BCRYPT_ROUNDS` | Number of bcrypt rounds for password hashing | `12` | No |
| `RATE_LIMIT_WINDOW` | Rate limiting window in milliseconds | `900000` | No |
| `RATE_LIMIT_MAX` | Maximum requests per window | `100` | No |
| `MAX_FILE_SIZE` | Maximum file upload size in bytes | `10485760` | No |
| `ALLOWED_MIME_TYPES` | Comma-separated list of allowed file types | See default | No |
| `UPLOAD_PATH` | Directory for file uploads | `./uploads` | No |
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` | No |
| `EMAIL_PORT` | SMTP server port | `587` | No |
| `EMAIL_SECURE` | Use secure SMTP connection | `false` | No |
| `EMAIL_USER` | SMTP username | - | No |
| `EMAIL_PASS` | SMTP password | - | No |
| `EMAIL_FROM` | From email address | `noreply@nexusmeet.com` | No |

### Frontend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_SERVER_URL` | Backend API URL | `http://localhost:3000` | Yes |
| `VITE_LIVEKIT_URL` | LiveKit WebSocket URL | `ws://localhost:7880` | Yes |
| `VITE_APP_NAME` | Application name | `NexusMeet` | No |
| `VITE_APP_VERSION` | Application version | `1.0.0` | No |
| `VITE_ENABLE_RECORDING` | Enable meeting recording | `true` | No |
| `VITE_ENABLE_SCREEN_SHARING` | Enable screen sharing | `true` | No |
| `VITE_ENABLE_CHAT` | Enable chat functionality | `true` | No |
| `VITE_ENABLE_FILE_SHARING` | Enable file sharing | `false` | No |
| `VITE_MAX_PARTICIPANTS` | Maximum participants per meeting | `50` | No |
| `VITE_MAX_MEETING_DURATION` | Maximum meeting duration in milliseconds | `86400000` | No |
| `VITE_MAX_FILE_SIZE` | Maximum file size in bytes | `10485760` | No |
| `VITE_THEME` | Default theme | `light` | No |
| `VITE_LANGUAGE` | Default language | `en` | No |
| `VITE_AUTO_JOIN_AUDIO` | Auto-join audio on meeting start | `false` | No |
| `VITE_AUTO_JOIN_VIDEO` | Auto-join video on meeting start | `false` | No |

## Setup Instructions

1. **Backend Setup:**
   ```bash
   cd apps/server
   cp env.example .env
   # Edit .env with your actual values
   ```

2. **Frontend Setup:**
   ```bash
   cd apps/web
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Required Variables for Development:**
   - `JWT_SECRET` - Generate a strong random string
   - `LIVEKIT_API_KEY` and `LIVEKIT_SECRET` - Get from LiveKit dashboard
   - `LIVEKIT_URL` - Your LiveKit server URL

4. **Production Considerations:**
   - Use strong, unique JWT secrets
   - Set up proper CORS origins
   - Configure email settings for notifications
   - Use environment-specific database URLs
   - Set up proper file storage (Cloudinary, AWS S3, etc.)

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets in production
- Regularly rotate JWT secrets
- Use HTTPS in production
- Configure proper CORS origins for production domains
