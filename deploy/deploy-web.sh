#!/bin/bash

# Exit on error
set -e

# Configuration
APP_NAME="nexusmeet"
APP_DIR="/var/www/$APP_NAME"
GIT_REPO="https://github.com/your-username/nexusmeet.git"
BRANCH="main"
NGINX_CONF="nexusmeet.conf"
NODE_ENV="production"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment of $APP_NAME web...${NC}"

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

# Create web directory if it doesn't exist
if [ ! -d "$WEB_DIR" ]; then
    echo -e "${YELLOW}Creating web directory...${NC}"
    mkdir -p "$WEB_DIR"
    chown -R $SUDO_USER:$SUDO_USER "$WEB_DIR"
fi

# Clone or update the repository
if [ ! -d "$WEB_DIR/.git" ]; then
    echo -e "${YELLOW}Cloning repository...${NC}"
    git clone -b "$BRANCH" "$GIT_REPO" "$WEB_DIR"
    chown -R $SUDO_USER:$SUDO_USER "$WEB_DIR"
else
    echo -e "${YELLOW}Updating repository...${NC}"
    cd "$WEB_DIR"
    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"
    chown -R $SUDO_USER:$SUDO_USER "$WEB_DIR"
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
cd "$WEB_DIR"
sudo -u $SUDO_USER npm install -g pnpm
sudo -u $SUDO_USER pnpm install

# Set up environment variables
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Creating .env.production file...${NC}"
    cp .env.example .env.production
    echo -e "${YELLOW}Please update the .env.production file with your configuration.${NC}"
    exit 1
fi

# Build the application
echo -e "${YELLOW}Building application...${NC}"
sudo -u $SUDO_USER pnpm build:prod

# Set permissions
echo -e "${YELLOW}Setting permissions...${NC}"
chown -R www-data:www-data "$WEB_DIR/dist"
chmod -R 755 "$WEB_DIR/dist"

# Restart Nginx
if systemctl is-active --quiet nginx; then
    echo -e "${YELLOW}Restarting Nginx...${NC}"
    systemctl restart nginx
else
    echo -e "${YELLOW}Nginx is not running. Starting Nginx...${NC}"
    systemctl start nginx
fi

echo -e "${GREEN}Web deployment completed successfully!${NC}"
