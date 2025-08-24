#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up Stellar Conferencing database..."

# Install dependencies if needed
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Navigate to server directory
cd apps/server

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Set up the database
echo "Setting up the database..."

# Generate Prisma client
echo "Generating Prisma client..."
pnpm db:generate

# Push database schema
echo "Pushing database schema..."
pnpm db:push

# Run migrations
echo "Running migrations..."
pnpm db:migrate

# Seed the database
echo "Seeding the database..."
pnpm db:seed

echo "✅ Database setup completed successfully!"
echo "You can now start the server with: pnpm start:prod"

# Open Prisma Studio to view the database
echo "Would you like to open Prisma Studio to view the database? (y/n)"
read -r answer
if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    pnpm db:studio
fi
