# Authentication Setup Guide

## Quick Start

1. **Copy environment variables**:
```bash
cp .env.example .env
```

2. **Edit `.env` and set secure values**:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePasswordHere123!
ADMIN_EMAIL=admin@yourdomain.com
SESSION_SECRET=generate_a_random_secret_key_here
```

3. **Create the initial admin user**:
```bash
npm run seed-admin
```

4. **Start the application**:
```bash
npm run dev
```

5. **Login at**: `/admin/login` with your credentials

## Environment Variables for Production (Vercel)

For production deployment on Vercel, configure environment variables in the Vercel Dashboard:

1. Go to your Vercel project
2. Navigate to **Settings > Environment Variables**
3. Add the following variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Random string (min 32 chars) |
| `ADMIN_USERNAME` | Yes | Admin username for seeding |
| `ADMIN_PASSWORD` | Yes | Strong admin password |
| `ADMIN_EMAIL` | No | Admin email address |
| `BCRYPT_SALT_ROUNDS` | No | Default: 10 |

4. Deploy the application
5. Run the seed script to create the admin user

## Security Features

✅ **Implemented**:
- Database-stored credentials (bcrypt hashed)
- Rate limiting (5 failed attempts = 15 min lockout)
- Session-based authentication with expiry
- Environment variable configuration
- IP tracking for login attempts
- HTTPS in production (automatic on Vercel)

## Changing Admin Password

To change the admin password:

1. Update `ADMIN_PASSWORD` in your `.env` or Vercel Environment Variables
2. Delete the existing admin user from the database
3. Run `npm run seed-admin` again

## Database Setup with Supabase

To set up the database:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > Database and copy the connection string
3. Add the connection string as `DATABASE_URL` in Vercel Environment Variables
4. Run database migrations: `npx drizzle-kit push`
5. Run seed script to create admin user in database
