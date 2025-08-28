#!/bin/bash

# Exit on error
set -e

# Configuration
APP_NAME="nexusmeet"
APP_DIR="/var/www/$APP_NAME"
SERVICE_FILE="nexusmeet-server.service"
SERVER_DIR="$APP_DIR/server"
GIT_REPO="https://github.com/your-username/nexusmeet.git"
BRANCH="main"
NODE_ENV="production"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment of $APP_NAME...${NC}"

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo -e "${YELLOW}This script must be run as root. Please use sudo.${NC}"
    exit 1
fi

# Install required packages if not already installed
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}Git not found. Installing git...${NC}"
    apt-get update && apt-get install -y git
fi

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 not found. Installing PM2...${NC}"
    npm install -g pm2
fi

# Create application directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Creating application directory...${NC}"
    mkdir -p "$APP_DIR"
    chown -R $SUDO_USER:$SUDO_USER "$APP_DIR"
fi

# Clone or update the repository
if [ ! -d "$SERVER_DIR/.git" ]; then
    echo -e "${YELLOW}Cloning repository...${NC}"
    git clone -b "$BRANCH" "$GIT_REPO" "$SERVER_DIR"
    chown -R $SUDO_USER:$SUDO_USER "$SERVER_DIR"
else
    echo -e "${YELLOW}Updating repository...${NC}"
    cd "$SERVER_DIR"
    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"
    chown -R $SUDO_USER:$SUDO_USER "$SERVER_DIR"
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
cd "$SERVER_DIR"
sudo -u $SUDO_USER npm install -g pnpm
sudo -u $SUDO_USER pnpm install

# Build the application
echo -e "${YELLOW}Building application...${NC}"
sudo -u $SUDO_USER pnpm build

# Set up environment variables
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Creating .env.production file...${NC}"
    cp .env.example .env.production
    echo -e "${YELLOW}Please update the .env.production file with your configuration.${NC}"
    exit 1
fi

# Restart the application
echo -e "${YELLOW}Restarting application...${NC}"
if pm2 list | grep -q "$APP_NAME"; then
    pm2 restart "$APP_NAME" --update-env
else
    pm2 start ecosystem.config.js --env production
    pm2 save
    pm2 startup
fi

# Set up log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Application is now running.${NC}"

# Show application status
pm2 status "$APP_NAME"
