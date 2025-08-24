# Stellar Conferencing - Deployment Guide

This guide provides instructions for deploying the Stellar Conferencing application to a production environment.

## Prerequisites

- Ubuntu 20.04/22.04 server
- Root access to the server
- Domain name with DNS configured
- SSL certificates (Let's Encrypt recommended)

## Server Setup

1. **Update the system**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install required packages**
   ```bash
   sudo apt install -y git nginx nodejs npm
   sudo npm install -g pnpm
   ```

3. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

## Database Setup

1. **Install PostgreSQL**
   ```bash
   sudo apt install -y postgresql postgresql-contrib
   ```

2. **Create a database and user**
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE stellar_conferencing;"
   sudo -u postgres psql -c "CREATE USER stellar WITH PASSWORD 'your_secure_password';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE stellar_conferencing TO stellar;"
   ```

## Application Deployment

### 1. Clone the repository
```bash
sudo mkdir -p /var/www/stellar-conferencing
sudo chown -R $USER:$USER /var/www/stellar-conferencing
cd /var/www/stellar-conferencing
git clone https://your-git-repo.com/your-username/stellar-conferencing.git .
```

### 2. Deploy the Server
```bash
cd /var/www/stellar-conferencing/apps/server
cp .env.example .env.production
# Edit .env.production with your configuration
pnpm install
pnpm build

# Start the server with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 3. Deploy the Web Client
```bash
cd /var/www/stellar-conferencing/apps/web
cp .env.example .env.production
# Edit .env.production with your configuration
pnpm install
pnpm build:prod

# Copy the built files to the web root
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
```

### 4. Configure Nginx

1. **Install Nginx**
   ```bash
   sudo apt install -y nginx
   ```

2. **Copy the Nginx configuration**
   ```bash
   sudo cp deploy/nginx/stellar-conferencing.conf /etc/nginx/sites-available/
   sudo ln -s /etc/nginx/sites-available/stellar-conferencing.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 5. Set up SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Post-Deployment

1. **Set up a firewall**
   ```bash
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

2. **Set up automatic updates**
   ```bash
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

3. **Set up log rotation**
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   pm2 set pm2-logrotate:compress true
   ```

## Maintenance

### Updating the application
```bash
# Pull the latest changes
cd /var/www/stellar-conferencing
git pull

# Update server
cd apps/server
pnpm install
pnpm build
pm2 restart ecosystem.config.js --env production

# Update web client
cd ../web
pnpm install
pnpm build:prod
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
```

### Monitoring
- Check PM2 status: `pm2 status`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check application logs: `pm2 logs stellar-server`

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :3000  # Check what's using port 3000
   sudo kill -9 <PID>  # Replace <PID> with the process ID
   ```

2. **Permission issues**
   ```bash
   sudo chown -R $USER:$USER /var/www/stellar-conferencing
   sudo chmod -R 755 /var/www/stellar-conferencing
   ```

3. **Nginx configuration test**
   ```bash
   sudo nginx -t
   ```

4. **Check service status**
   ```bash
   sudo systemctl status nginx
   pm2 status
   ```
