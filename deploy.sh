#!/bin/bash

echo "🚀 Deploying SITA Bot Frontend to EC2..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build Next.js for production
echo "🔨 Building Next.js..."
npm run build

# Start with PM2
echo "🔧 Starting application with PM2..."
pm2 stop sita-bot-frontend 2>/dev/null || true
pm2 delete sita-bot-frontend 2>/dev/null || true
pm2 start npm --name sita-bot-frontend -- start

# Save PM2 configuration
pm2 save
pm2 startup

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/sita-bot > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/sita-bot /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Frontend deployed successfully!"
echo "🔍 Check logs with: pm2 logs sita-bot-frontend"
echo "🌐 Access at: http://$(curl -s ifconfig.me)"
