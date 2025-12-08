# Authentication Setup - Novalyte™ AI Admin Dashboard

## Quick Start

1. **Create `.env.local` file** in the root directory with:
   ```
   ADMIN_EMAIL=hello@novalyte.io
   ADMIN_PASSWORD=Yankees200
   SESSION_SECRET=novalyte-admin-secret-key-change-in-production
   ```

2. **Access the login page** at `/login` or visit `admin.novalyte.io/login`

3. **Login credentials**:
   - Email: `hello@novalyte.io`
   - Password: `Yankees200`

## Features

- ✅ Beautiful, modern login screen matching Novalyte brand
- ✅ Session-based authentication
- ✅ Protected routes (all dashboard pages require login)
- ✅ Automatic redirect to login if not authenticated
- ✅ Logout functionality in sidebar
- ✅ Secure cookie-based sessions

## Architecture

- **Login Page**: `/app/login/page.tsx` - Beautiful login UI
- **Auth API**: `/app/api/auth/*` - Login, logout, check endpoints
- **Middleware**: `/middleware.ts` - Route protection
- **Dashboard Layout**: `/app/dashboard-layout.tsx` - Wraps authenticated pages

## Security Notes

- In production, change `SESSION_SECRET` to a strong random string
- Consider using environment-specific credentials
- Sessions expire after 24 hours
- All authentication endpoints are protected

## Customization

To change credentials, update `.env.local`:
```bash
ADMIN_EMAIL=your-email@domain.com
ADMIN_PASSWORD=your-secure-password
```

Then restart your Next.js server.

