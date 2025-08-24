#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found, installing..."
    npm install -g pm2
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build the application
echo "Building application..."
pnpm build

# Start the application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list for startup
echo "Saving PM2 process list..."
pm2 save

# Generate PM2 startup script
echo "Generating PM2 startup script..."
sudo pm2 startup

# Save the PM2 process list for startup
echo "Saving PM2 process list for startup..."
sudo pm2 save

echo "Setup complete!"
