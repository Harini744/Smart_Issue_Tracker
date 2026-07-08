# Docker Setup Guide

This guide will help you deploy the Smart Issue Tracker using Docker and Docker Compose.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed
- 4GB+ RAM allocated to Docker
- Internet connection for downloading images

---

## Quick Start

### 1. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update the following (at minimum):

```env
MONGO_ROOT_PASSWORD=change_this_to_a_strong_password
JWT_SECRET=generate_a_random_string_min_32_chars
```

### 2. Build and Start Services

```bash
# Build all images (first time only, takes 5-10 minutes)
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access the Application

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost | React app |
| Backend API | http://localhost:5000/api | Express server |
| AI Service | http://localhost:8000 | FastAPI + Swagger docs at /docs |
| MongoDB | localhost:27017 | Internal only |

---

## Seed Demo Users

After services are running, seed the database:

```bash
docker-compose exec backend npm run seed
```

**Demo Credentials:**
- Admin: `admin@college.edu` / `admin123`
- Student: `student@college.edu` / `student123`

---

## Common Commands

### View Running Services
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ai-service
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Data
```bash
# Warning: This deletes the MongoDB data
docker-compose down -v
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Access MongoDB Shell
```bash
docker-compose exec mongodb mongosh -u root -p rootpassword
```

### Check Service Health
```bash
docker-compose ps  # View health status

# Or check individual service
docker-compose exec backend npm run health
```

---

## Configuration

### Environment Variables (`.env`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGO_ROOT_PASSWORD` | MongoDB root password | `secure_password_123` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | `your-long-random-string-here` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:3000` |
| `EMAIL_USER` | Gmail address (optional) | `your@gmail.com` |
| `EMAIL_PASS` | Gmail app password (optional) | `xxxx xxxx xxxx xxxx` |
| `CLOUDINARY_*` | Cloud image storage (optional) | - |

**JWT_SECRET Generation:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))
```

---

## Production Deployment

### 1. Update Environment Variables

```env
NODE_ENV=production
JWT_SECRET=your-production-secret-key
CLIENT_URL=https://your-domain.com
MONGO_ROOT_PASSWORD=production-database-password
```

### 2. Use Managed MongoDB

Replace `mongodb` service with MongoDB Atlas:

```bash
# In .env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/smart-issue-tracker?retryWrites=true&w=majority

# Remove mongodb service from docker-compose.yml
```

### 3. Enable HTTPS (Nginx reverse proxy or use Cloudflare)

```yaml
# Example with Traefik
services:
  traefik:
    image: traefik:v2.10
    ports:
      - "443:443"
    command:
      - "--entrypoints.websecure.address=:443"
      - "--providers.docker=true"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
```

### 4. Set Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

---

## Troubleshooting

### Services not starting

```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Port Already in Use

```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process or change port in docker-compose.yml
```

### MongoDB Connection Error

```bash
# Verify MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Frontend shows blank page

- Clear browser cache (Ctrl+Shift+Delete)
- Check if backend is running: `docker-compose ps`
- Check frontend logs: `docker-compose logs frontend`

### AI Service not responding

```bash
# Check if models are downloaded
docker-compose exec ai-service ls -la models/

# Restart service
docker-compose restart ai-service
```

---

## Performance Tips

1. **Allocate sufficient Docker resources:**
   - Docker Desktop → Settings → Resources → Memory: 4GB+

2. **Use volumes for database:**
   - MongoDB data persists in `mongo_data` volume
   - Check with: `docker volume ls`

3. **Enable Docker BuildKit for faster builds:**
   ```bash
   export DOCKER_BUILDKIT=1
   docker-compose build
   ```

4. **Clean up unused images/containers:**
   ```bash
   docker system prune -a
   ```

---

## Next Steps

- **Local Development:** See [SETUP.md](SETUP.md)
- **Production Deploy:** See [README.md](README.md) deployment section
- **API Documentation:** http://localhost:5000/api/docs (Swagger)
- **AI Service Docs:** http://localhost:8000/docs (FastAPI)
