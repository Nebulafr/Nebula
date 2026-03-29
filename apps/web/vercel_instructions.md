# Vercel Deployment Instructions for Nebula Web App

Follow these steps to deploy the `@nebula/web` app to Vercel.

### 1. Repository Setup
- Connect your GitHub/GitLab repository to Vercel.
- Select the project from the list.

### 2. Configure Project
- **Framework Preset**: `Next.js`
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && npm install && npx turbo run build --filter=@nebula/web`
  - *Note: Vercel may automatically detect the correct command; ensure it includes the filter.*
- **Output Directory**: `(Leave default)`

### 3. Environment Variables
Copy the following variables from your local `apps/web/.env` to the Vercel Dashboard (Project Settings > Environment Variables):

| Key | Value / Source |
|---|---|
| `DATABASE_URL` | Your Neon/Postgres connection string |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` |
| `NEXTAUTH_SECRET` | A secure random string |
| `NEXT_PUBLIC_WS_URL` | `https://your-chat-server.onrender.com` (Update after Render deployment) |
| `ACCESS_TOKEN_SECRET` | (Same as chat server) |
| `REFRESH_TOKEN_SECRET` | (Same as chat server) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | From Cloudinary |
| `CLOUDINARY_API_KEY` | From Cloudinary |
| `CLOUDINARY_API_SECRET` | From Cloudinary |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | From Firebase |
| ... | (Rest of variables from `.env`) |

### 4. Deploy
Click **Deploy**. Once finished, you will get a production URL. Remember to use this URL to update the `NEXT_PUBLIC_APP_URL` on Render.

### 5. Post-Deployment
- Update `NEXT_PUBLIC_WS_URL` in Vercel settings if your Render URL changes.
- Update `NEXT_PUBLIC_APP_URL` in Render settings if your Vercel URL changes (for CORS).
