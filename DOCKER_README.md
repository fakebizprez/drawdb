# DrawDB Docker Compose Setup

A comprehensive Docker Compose configuration for running DrawDB in both development and production environments.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Development Environment](#development-environment)
- [Production Environment](#production-environment)
- [Environment Configuration](#environment-configuration)
- [Available Commands](#available-commands)
- [Services](#services)
- [Troubleshooting](#troubleshooting)
- [Backup & Recovery](#backup--recovery)
- [Security Considerations](#security-considerations)

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Make (optional, for convenience commands)

### Development Setup

1. **Clone and setup environment:**
   ```bash
   git clone <repository-url>
   cd drawdb
   make setup-env  # Or manually copy environment templates
   ```

2. **Configure environment variables:**
   ```bash
   # Edit development settings
   vim .env.development
   ```

3. **Start development environment:**
   ```bash
   make dev
   # or
   docker-compose -f docker-compose.development.yml up -d
   ```

4. **Access applications:**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3001
   - **MailHog**: http://localhost:8025
   - **pgAdmin**: http://localhost:8080

### Production Setup

1. **Configure production environment:**
   ```bash
   cp docker/env.production.template .env.production
   vim .env.production  # Configure with your production values
   ```

2. **Start production environment:**
   ```bash
   make prod
   # or
   docker-compose -f docker-compose.production.yml up -d
   ```

3. **Access application:**
   - **Application**: http://localhost (or your domain)
   - **Monitoring**: http://localhost:9090

## 🏗️ Architecture Overview

The Docker Compose setup provides a complete microservices architecture:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Nginx    │    │  Frontend   │    │   Backend   │
│ (Prod Only) │◄──►│   (React)   │◄──►│    (API)    │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │    Redis    │    │ PostgreSQL  │
                   │   (Cache)   │    │ (Database)  │
                   └─────────────┘    └─────────────┘
```

### Development vs Production

| Component | Development | Production |
|-----------|-------------|------------|
| **Frontend** | Vite dev server with HMR | Static build served by Nginx |
| **Backend** | Mock API with hot reload | Optimized Node.js container |
| **Proxy** | Direct container access | Nginx reverse proxy |
| **Database** | PostgreSQL with exposed ports | Internal PostgreSQL |
| **Cache** | Redis with exposed ports | Internal Redis |
| **Email** | MailHog for testing | Real SMTP server |
| **Monitoring** | Basic logs | Prometheus + health checks |

## 💻 Development Environment

### Features

- **Hot Reload**: Frontend and backend automatically reload on changes
- **Package Manager**: Uses pnpm instead of npm (as requested)
- **Email Testing**: MailHog captures all emails
- **Database Admin**: pgAdmin for database management
- **Live Logs**: Real-time log streaming
- **Volume Mounts**: Source code mounted for development

### Services

| Service | Port | Purpose |
|---------|------|---------|
| drawdb-frontend | 5173 | React development server |
| drawdb-backend | 3001 | Mock API server |
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Redis cache |
| mailhog | 8025/1025 | Email testing (UI/SMTP) |
| pgadmin | 8080 | Database administration |

### Development Commands

```bash
# Start development environment
make dev

# View logs
make dev-logs

# Stop development environment
make dev-down

# Rebuild containers
make build-dev

# Check service health
make health
```

## 🌐 Production Environment

### Features

- **High Availability**: Multiple replicas for frontend and backend
- **Load Balancing**: Nginx reverse proxy with load balancing
- **Security**: Security headers, rate limiting, SSL support
- **Monitoring**: Prometheus for metrics collection
- **Backup**: Automated PostgreSQL backups
- **Optimization**: Compressed assets, caching, minimal containers

### Services

| Service | Replicas | Purpose |
|---------|----------|---------|
| nginx | 1 | Reverse proxy & load balancer |
| drawdb-frontend | 2 | React production build |
| drawdb-backend | 2 | API server |
| postgres | 1 | PostgreSQL database |
| redis | 1 | Redis cache |
| backup | 0* | Database backup service |
| prometheus | 1 | Monitoring and metrics |

*Backup service runs on-demand

### Production Commands

```bash
# Start production environment
make prod

# View logs
make prod-logs

# Stop production environment
make prod-down

# Create database backup
make backup

# Build production images
make build-prod
```

## ⚙️ Environment Configuration

### Development (.env.development)

```bash
# Frontend
VITE_APP_ENV=development
VITE_BACKEND_URL=http://localhost:3001/api
VITE_DEBUG=true

# Database
DATABASE_URL=postgresql://drawdb:drawdb_password@postgres:5432/drawdb

# Email (MailHog)
SMTP_HOST=mailhog
SMTP_PORT=1025

# Ports
FRONTEND_PORT=5173
BACKEND_PORT=3001
```

### Production (.env.production)

```bash
# Frontend
VITE_APP_ENV=production
VITE_BACKEND_URL=https://api.yourdomain.com/api
VITE_DEBUG=false

# Database (use strong passwords!)
DATABASE_URL=postgresql://drawdb:STRONG_PASSWORD@postgres:5432/drawdb

# Email (real SMTP)
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-smtp-password

# Security
JWT_SECRET=your-super-secure-jwt-secret
```

## 🛠️ Available Commands

The Makefile provides convenient commands for managing the Docker environment:

```bash
# Environment Management
make dev          # Start development environment
make prod         # Start production environment
make setup-env    # Setup environment files from templates

# Container Management
make build-dev    # Build development images
make build-prod   # Build production images
make logs         # Show logs for all services
make clean        # Clean up containers and volumes

# Database Operations
make db-seed      # Seed database with sample data
make db-reset     # Reset database (DESTRUCTIVE!)
make backup       # Create database backup

# Utilities
make health       # Check service health status
make lint         # Run code linting
make help         # Show all available commands
```

## 🧩 Services

### Frontend (React + Vite)

**Development:**
- Uses `node:20-alpine` with pnpm
- Mounts source code for hot reload
- Exposes port 5173

**Production:**
- Multi-stage build with Nginx
- Optimized static assets
- Gzip compression enabled

### Backend (Mock API)

**Development:**
- Node.js server with auto-restart
- Mock endpoints for email and gists
- CORS enabled for frontend

**Production:**
- Optimized container with security updates
- Health checks and monitoring
- Rate limiting and security headers

### Database (PostgreSQL)

- Version: PostgreSQL 16
- Pre-configured with schemas for users, diagrams, and analytics
- Automatic backups in production
- Health checks and performance tuning

### Cache (Redis)

- Version: Redis 7
- Configured for optimal performance
- Persistence enabled
- Memory management optimized

### Proxy (Nginx)

**Production only:**
- Reverse proxy with load balancing
- SSL/TLS termination ready
- Security headers and rate limiting
- Static asset caching

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check which ports are in use
   lsof -i :5173
   
   # Change ports in environment file
   vim .env.development
   ```

2. **Permission errors:**
   ```bash
   # Fix Docker permissions
   sudo chown -R $USER:$USER .
   ```

3. **Container won't start:**
   ```bash
   # Check logs
   docker-compose logs <service-name>
   
   # Rebuild container
   docker-compose build <service-name>
   ```

4. **Database connection issues:**
   ```bash
   # Check database is running
   docker-compose exec postgres pg_isready -U drawdb
   
   # Reset database
   make db-reset
   ```

### Health Checks

All services include health checks that can be monitored:

```bash
# Check all service status
docker-compose ps

# Check specific service logs
docker-compose logs drawdb-frontend

# Check service health
make health
```

## 💾 Backup & Recovery

### Automated Backups

Production environment includes automated backup system:

```bash
# Create manual backup
make backup

# Backup files location
ls -la ./backups/postgres/
```

### Backup Retention

- Default retention: 7 days
- Configurable via `BACKUP_RETENTION_DAYS`
- Both custom and plain SQL formats

### Recovery

```bash
# Restore from backup
docker-compose exec postgres psql -U drawdb -d drawdb < /backups/backup_file.sql

# Or restore from custom format
docker-compose exec postgres pg_restore -U drawdb -d drawdb /backups/backup_file.custom
```

## 🔒 Security Considerations

### Development

- Uses default passwords (acceptable for local development)
- Exposes database ports for debugging
- Debug mode enabled
- No rate limiting

### Production

- **Change all default passwords!**
- Use strong, unique passwords
- Keep containers internal (no exposed ports except 80/443)
- Enable rate limiting
- Use SSL/TLS certificates
- Regular security updates

### Environment Variables

```bash
# Critical variables to secure in production:
DATABASE_PASSWORD=<strong-unique-password>
JWT_SECRET=<long-random-secret>
GITHUB_CLIENT_SECRET=<your-github-secret>
SMTP_PASS=<your-email-password>
```

### Network Security

- Internal Docker networks isolate services
- Nginx proxy provides additional security layer
- Rate limiting prevents abuse
- Security headers protect against common attacks

---

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Docker Compose logs: `make logs`
3. Check service health: `make health`
4. Open an issue in the repository

## 🎯 Next Steps

1. **Configure environment variables** for your specific setup
2. **Set up SSL/TLS certificates** for production
3. **Configure monitoring** and alerting
4. **Set up CI/CD pipeline** for automated deployments
5. **Implement proper logging** aggregation
6. **Configure backup schedule** automation

---

*This Docker Compose setup provides a robust foundation for running DrawDB in any environment. Customize the configuration files to match your specific requirements.*