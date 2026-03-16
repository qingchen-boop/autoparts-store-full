# AutoParts Store - Deployment Guide

## Prerequisites

- Docker & Docker Compose
- 4GB+ RAM
- 20GB+ Storage
- Domain name (optional)

## Quick Start

### 1. Clone & Configure

```bash
cd /root/.openclaw/workspace/autoparts-store

# Create environment file
cp .env.example .env
nano .env
```

Edit `.env`:
```env
JWT_SECRET=your-secure-secret-key-min-32-chars
DB_PASSWORD=your-secure-db-password
```

### 2. Build & Start

```bash
cd docker

# Build and start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 3. Access

- Frontend: http://your-server-ip
- API: http://your-server-ip/api/v1

## Services

| Service | Port | Description |
|---------|------|-------------|
| Nginx | 80 | Reverse Proxy |
| Frontend | 3002 | Next.js App |
| Backend | 3001 | REST API |
| PostgreSQL | 5432 | Database |

## Common Commands

```bash
# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend

# Rebuild
docker-compose build --no-cache

# Stop
docker-compose down

# Database backup
docker exec autoparts-db pg_dump -U postgres autoparts > backup.sql
```

## Production Checklist

- [ ] Change JWT_SECRET
- [ ] Change DB_PASSWORD  
- [ ] Configure SSL/HTTPS
- [ ] Set up domain
- [ ] Configure backups
- [ ] Set up monitoring

## Domain & SSL

For SSL, use Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Support

For issues, check logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```
