# Nebula Socket Server

Standalone Node.js Socket.IO server for real-time messaging in the Nebula application.

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL=your-postgres-connection-string

# Authentication
ACCESS_TOKEN_SECRET=your-access-token-secret

# Application URLs
NEXT_PUBLIC_APP_URL=https://your-main-app-url.com

# Server Port
PORT=9001

# Environment
NODE_ENV=production
```

## Installation & Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations (if needed)
npx prisma migrate deploy

# Start the server
npm start
```

## Development

```bash
# Run in development mode with auto-reload
npm run dev
```

## Deployment

### Railway
1. Create new project on Railway
2. Connect this socket-server directory
3. Set environment variables
4. Deploy

### Heroku
```bash
# Create Heroku app
heroku create your-socket-server-name

# Set environment variables
heroku config:set DATABASE_URL=your-db-url
heroku config:set ACCESS_TOKEN_SECRET=your-secret
heroku config:set NEXT_PUBLIC_APP_URL=https://your-main-app.vercel.app

# Deploy
git subtree push --prefix=socket-server heroku main
```

### DigitalOcean App Platform
1. Create new app
2. Point to this socket-server directory
3. Set environment variables
4. Deploy

## Production URLs

Update the main app's `NEXT_PUBLIC_WS_URL` to point to your deployed socket server:

- Railway: `https://your-app-production.up.railway.app`
- Heroku: `https://your-socket-server-name.herokuapp.com`
- DigitalOcean: `https://your-app-name.ondigitalocean.app`