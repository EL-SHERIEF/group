# Production Setup Guide

## Prerequisites

1. **PostgreSQL Database** (Supabase recommended)
2. **Vercel Account** for deployment
3. **Environment Variables** configured

## Step 1: Create PostgreSQL Database

### Using Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Navigate to Settings > Database
4. Copy the **Connection String** (URI format)
5. Make sure to select "Transaction" pooling mode for the connection string

The connection string format should be:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Using Other PostgreSQL Providers

You can also use:
- **Neon** (neon.tech) - Serverless Postgres
- **Railway** (railway.app) - Simple cloud database
- **PlanetScale** (planetscale.com) - MySQL-compatible

## Step 2: Set Environment Variables

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add the following variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Random string (min 32 characters) for session encryption |
| `NODE_ENV` | No | Set to `production` (auto-set by Vercel) |
| `CORS_ORIGIN` | No | Your production domain (optional) |

Example values:
```bash
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres
SESSION_SECRET=your-random-secret-key-min-32-chars
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### For Local Development

Create a `.env` file:
```bash
cp .env.example .env
# Edit .env with your Supabase connection string
```

## Step 3: Run Database Migrations

After setting up the database, run migrations using Drizzle:

```bash
npx drizzle-kit push
```

This will create all necessary tables in your PostgreSQL database.

For production, you can run migrations by setting the DATABASE_URL:
```bash
DATABASE_URL="your-supabase-url" npx drizzle-kit push
```

## Step 4: Create Admin User

Run the seed script to create your admin user:

```bash
ADMIN_PASSWORD=your-secure-password npm run seed:admin
```

Or create manually via the create-admin script:

```bash
npm run create-admin
```

## Step 5: Deploy to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`
6. Add environment variables
7. Deploy

Your application is now ready for production deployment. The app will:
- ✅ Connect to Supabase PostgreSQL database
- ✅ Persist all data across deployments
- ✅ Support multiple serverless instances
- ✅ Handle concurrent users properly

## Troubleshooting

### Connection Issues
- Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- For Supabase: Use the "Transaction" pooler connection string
- Ensure SSL is enabled: connection strings should include SSL by default

### Migration Errors
- Ensure database is empty before first migration
- Check PostgreSQL version compatibility (v15+ recommended)

### Session Issues
- Ensure `SESSION_SECRET` is set and at least 32 characters long
- Consider using `connect-pg-simple` for production session storage
