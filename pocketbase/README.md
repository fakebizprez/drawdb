# DrawDB with PocketBase Backend

This setup provides DrawDB with a PocketBase backend that includes:

## 🎯 Features

- **SQLite Database** - Local file-based database
- **Admin Dashboard** - PocketBase admin UI at http://localhost:8090/_/
- **REST API** - Full REST API for diagrams and gists
- **Authentication** - User registration and login
- **Real-time** - WebSocket subscriptions for live updates
- **File Storage** - Built-in file upload support

## 🚀 Quick Start

```bash
# Start both DrawDB and PocketBase
docker-compose -f compose.pocketbase.yml up -d

# Access applications
# DrawDB: http://localhost:5173
# PocketBase Admin: http://localhost:8090/_/
```

## 🔧 First Time Setup

1. **Start the services:**
   ```bash
   docker-compose -f compose.pocketbase.yml up -d
   ```

2. **Setup PocketBase Admin:**
   - Go to http://localhost:8090/_/
   - Create your admin account
   - The database will be automatically initialized with collections

3. **Use DrawDB:**
   - Go to http://localhost:5173
   - Your diagrams will now be saved to PocketBase instead of browser storage
   - You can share diagrams and collaborate

## 📊 Database Collections

### Users Collection
- **Email/Username authentication**
- **Profile information**
- **Avatar support**

### Diagrams Collection
- **title** - Diagram name
- **description** - Optional description  
- **data** - JSON diagram data
- **owner** - User who created it
- **is_public** - Whether publicly viewable
- **tags** - Comma-separated tags

### Gists Collection
- **gist_id** - Unique identifier
- **github_gist_id** - Optional GitHub gist ID
- **title** - Gist title
- **content** - JSON content
- **owner** - User who created it
- **is_public** - Whether publicly viewable

## 🔗 API Endpoints

The PocketBase setup provides these DrawDB-compatible endpoints:

### Email API
- `POST /api/email/send` - Send email (mock implementation)

### Gists API  
- `POST /api/gists` - Create new gist
- `GET /api/gists/:gistId` - Get gist by ID
- `PATCH /api/gists/:gistId` - Update gist
- `DELETE /api/gists/:gistId` - Delete gist

### Standard PocketBase API
- `GET /api/collections/diagrams/records` - List diagrams
- `POST /api/collections/diagrams/records` - Create diagram
- `GET /api/collections/diagrams/records/:id` - Get diagram
- `PATCH /api/collections/diagrams/records/:id` - Update diagram
- `DELETE /api/collections/diagrams/records/:id` - Delete diagram

## 🛠️ Development

### Database Migrations
Migrations are stored in `pocketbase/migrations/` and run automatically.

### Server Hooks
Custom logic is in `pocketbase/hooks/main.pb.js` including:
- Auto-setting diagram owner
- Custom API routes
- Business logic

### Data Location
- **Database**: `pocketbase_data/data.db`
- **Files**: `pocketbase_data/storage/`
- **Logs**: `pocketbase_data/logs/`

## 🔒 Security

### Default Access Rules
- **Diagrams**: Users can only see their own + public diagrams
- **Gists**: Users can only see their own + public gists  
- **Users**: Users can only see their own profile

### Authentication
- Email/password authentication enabled
- Username authentication enabled
- OAuth2 ready (GitHub, Google, etc.)

## 📝 Environment Variables

- `PB_ENCRYPTION_KEY` - Database encryption key (change in production!)
- `VITE_BACKEND_URL` - Frontend API URL (set to PocketBase)

## 🚀 Production Notes

1. **Change the encryption key** in production
2. **Setup SSL/TLS** for HTTPS
3. **Configure OAuth providers** if needed
4. **Setup proper backups** of the SQLite database
5. **Configure email** for password resets

## 🔧 Useful Commands

```bash
# View logs
docker-compose -f compose.pocketbase.yml logs -f

# Backup database
docker exec drawdb-pocketbase cp /pb_data/data.db /pb_data/backup.db

# Access PocketBase shell
docker exec -it drawdb-pocketbase sh

# Stop services
docker-compose -f compose.pocketbase.yml down

# Reset everything (DANGEROUS!)
docker-compose -f compose.pocketbase.yml down -v
```