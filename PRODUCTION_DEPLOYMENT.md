# Production Deployment Guide: Gencom Pay

This guide outlines the steps to deploy the Gencom Pay platform on an Ubuntu 24.04 server with aaPanel and Docker.

## Server Prerequisites
- Ubuntu 24.04
- Docker & Docker Compose installed
- aaPanel installed (for Nginx/Reverse Proxy management)

## Deployment Steps

### 0. Connect to your Server
Open your terminal (PowerShell, CMD, or Terminal) and run:
```bash
ssh root@217.76.50.205
```
*(Enter your password when prompted)*

### 1. Clone & Prepare
Once logged in, navigate to your deployment directory (usually `/www/wwwroot/` if using aaPanel) and pull the code:
```bash
cd /www/wwwroot/
git clone https://github.com/cyrongau/gencom-pay.git
cd gencom-pay
```
*If the folder already exists and you just want to update:*
```bash
cd /www/wwwroot/gencom-pay
git pull origin main
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DB_PASSWORD=your_secure_db_password
JWT_SECRET=your_production_jwt_secret
NEXT_PUBLIC_API_URL=https://api.generexcom.com
```

### 3. Launch with Docker Compose
```bash
docker-compose up -d --build
```
This will build and start:
- **Postgres** (Port 5444)
- **Redis** (Port 6388)
- **API** (Port 4000)
- **Web** (Port 3000)

### 4. aaPanel Reverse Proxy Configuration
You **should** SSH into your server and run the steps above. Once the containers are running, follow these steps in aaPanel to make the app accessible via your subdomains:

1. **Create Sites**:
   - Go to **Website -> Add site**.
   - Create `pay.generexcom.com` (Select "PHP-00" as no PHP is needed for Docker).
   - Create `api.generexcom.com`.

2. **Configure Web Proxy** (for `pay.generexcom.com`):
   - Click the site name -> **Reverse Proxy -> Add reverse proxy**.
   - **Proxy Name**: `Gencom-Web`
   - **Target URL**: `http://127.0.0.1:3000`
   - **Sent Domain**: `$host`
   - Click **Submit**.

3. **Configure API Proxy** (for `api.generexcom.com`):
   - Click the site name -> **Reverse Proxy -> Add reverse proxy**.
   - **Proxy Name**: `Gencom-API`
   - **Target URL**: `http://127.0.0.1:4000`
   - **Sent Domain**: `$host`
   - Click **Submit**.

4. **SSL Setup**:
   - Go to **Website -> [Site Name] -> SSL**.
   - Select **Let's Encrypt**, check your domain, and click **Apply**.
   - Do this for both subdomains to enable `https`.

### 5. Why use SSH?
You **can and should** use SSH to manage your server! The steps in this guide (Cloning, .env creation, and Docker commands) are designed to be run via SSH. 

- **Pulling Code**: Running `git pull` via SSH is the fastest way to update your server when you make changes locally.
- **Docker Control**: SSH gives you the power to run `docker-compose logs -f` to see real-time errors if something goes wrong.

### 6. Media Persistence
The `docker-compose.yml` is configured to mount `./api/uploads` to the container. Ensure this directory has write permissions:
```bash
chmod -R 777 api/uploads
```

## Mobile App Native Assets
To update the native app icon and splash screen before building your `.apk` or `.ipa`:

1. Place your `icon.png` and `splash.png` in `mobile/assets/branding/`.
2. Run the generator commands:
```bash
cd mobile
flutter pub run flutter_launcher_icons:main
flutter pub run flutter_native_splash:create
```
