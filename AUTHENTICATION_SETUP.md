# Authentication Setup Guide

## Overview

The Family Task Scheduler now supports flexible authentication that works out-of-the-box in development without requiring OAuth credentials.

## Authentication Methods

The application supports three authentication methods:

1. **Email/Password (Development Only)** - Works immediately without any setup
2. **Google OAuth** - Optional, requires Google Cloud Console setup
3. **Microsoft OAuth** - Optional, requires Azure AD setup

## Quick Start (Development)

The app is now ready to use immediately for development:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/signin`

3. Sign in with any of the pre-seeded test accounts:
   - **Email:** `parent.a@example.com` / **Password:** any password
   - **Email:** `parent.b@example.com` / **Password:** any password
   - **Email:** `teen@example.com` / **Password:** any password

4. Or create a new account by entering any email address and password

> In development mode, the app automatically creates user accounts when you sign in with credentials. Any password will work because password validation is disabled in development.

## How It Works

### Development Mode Behavior

When OAuth credentials are not configured (the default state):

- **Credentials Provider is Active:** Email/password authentication works without validation
- **OAuth Providers are Disabled:** Google and Microsoft buttons will still appear but OAuth is gracefully disabled
- **Auto-User Creation:** Any email/password combination creates/finds a user automatically
- **JWT Sessions:** Uses JWT-based sessions (no database session required)
- **Debug Mode:** Enhanced logging for troubleshooting

### Production Mode Behavior

In production (`NODE_ENV=production`):

- **Credentials Provider is Disabled:** Email/password authentication won't work
- **OAuth Required:** You must configure at least one OAuth provider
- **Database Sessions:** Uses secure database sessions
- **No Auto-Creation:** Users must authenticate through OAuth

## Configuration Files Changed

### 1. `/src/lib/auth.ts`

**Key Changes:**
- Added `CredentialsProvider` for development authentication
- OAuth providers are conditionally loaded based on environment variables
- Session strategy switches between JWT (dev) and database (production)
- Added debug mode for development
- Auto-creates users in development mode

**Code Structure:**
```typescript
// Checks if OAuth credentials are configured
const hasGoogleCredentials = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

// Only adds OAuth providers if configured
providers: [
  ...(hasGoogleCredentials ? [GoogleProvider({...})] : []),
  ...(hasMicrosoftCredentials ? [AzureADProvider({...})] : []),
  CredentialsProvider({...}), // Always available
]
```

### 2. `/src/app/auth/signin/page.tsx`

**Key Changes:**
- Added email/password input form
- Form submission handling with error states
- Better error messages for authentication failures
- Visual separator between methods
- Loading states during authentication

**User Experience:**
- Email/password form at the top (primary method in dev)
- OAuth buttons below (secondary, optional)
- Clear error messages
- Development mode hint in password field

### 3. `/prisma/seed.ts`

**Key Changes:**
- Added `emailVerified: new Date()` to all seeded users
- This allows seeded users to authenticate immediately

### 4. `.env` and `.env.example`

**Key Changes:**
- Clear documentation about authentication methods
- Instructions for development vs production
- Default empty OAuth credentials
- Comments explaining test users and behavior

## Testing the Authentication

A test script has been created to verify the authentication flow:

```bash
node test-auth.mjs
```

This script tests:
1. Sign-in page accessibility
2. Available authentication providers
3. Credentials authentication flow
4. Proper handling of missing OAuth credentials

## Setting Up OAuth (Optional for Production)

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Create OAuth 2.0 Client ID credentials
4. Configure authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
5. Copy the Client ID and Client Secret to your `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

### Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps)
2. Register a new application
3. Configure redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/azure-ad`
   - Production: `https://yourdomain.com/api/auth/callback/azure-ad`
4. Create a client secret
5. Copy the credentials to your `.env`:
   ```env
   MICROSOFT_CLIENT_ID="your-client-id"
   MICROSOFT_CLIENT_SECRET="your-client-secret"
   MICROSOFT_TENANT_ID="common"
   ```

## Seeding Test Data

To reset and reseed the database with test users:

```bash
# Reset the database (warning: deletes all data)
rm prisma/dev.db

# Run migrations
npm run db:push

# Seed test data
npm run db:seed
```

This creates:
- 3 test users (parent.a@example.com, parent.b@example.com, teen@example.com)
- 1 household (Kallio Family)
- 5 sample tasks
- Gamification profiles and badges

## Security Considerations

### Development
- Password validation is intentionally disabled
- Users are auto-created without verification
- Debug logging is enabled
- JWT sessions for simplicity

### Production
- Email/password authentication is completely disabled
- OAuth is required for authentication
- Database sessions for security
- No auto-user creation
- Proper password hashing would be required if implementing production credentials

## Troubleshooting

### Issue: "Credentials authentication is only available in development mode"
**Solution:** Check that `NODE_ENV=development` in your `.env` file

### Issue: OAuth buttons don't work
**Expected Behavior:** In development without OAuth credentials, the buttons may appear but won't function. This is intentional. Use email/password instead.

### Issue: "Invalid credentials" error
**Solution:** In development mode, any password should work. Make sure you're running in development mode and the database is seeded.

### Issue: Session not persisting
**Solution:** Check that cookies are enabled in your browser and NEXTAUTH_SECRET is set in `.env`

## Architecture Decisions

### Why Credentials Provider in Development?

1. **Faster Development:** No need to set up OAuth credentials
2. **Easier Testing:** Multiple test accounts ready to use
3. **Offline Development:** Work without internet connection
4. **Simplified Onboarding:** New developers can start immediately

### Why Disable in Production?

1. **Security:** Managing passwords securely is complex
2. **OAuth Benefits:** Better security, social login, no password management
3. **Industry Standard:** Most modern apps use OAuth for authentication

### Session Strategy

- **Development:** JWT (simpler, no database overhead)
- **Production:** Database sessions (more secure, supports token refresh)

## Related Files

- `/src/lib/auth.ts` - NextAuth configuration
- `/src/app/api/auth/[...nextauth]/route.ts` - NextAuth API routes
- `/src/app/auth/signin/page.tsx` - Sign-in page UI
- `/src/app/auth/error/page.tsx` - Error page UI
- `/prisma/seed.ts` - Database seeding script
- `/.env` - Environment configuration
- `/test-auth.mjs` - Authentication test script

## Summary

The authentication system is now:
- **Working immediately** without OAuth setup
- **Developer-friendly** with test accounts
- **Production-ready** when OAuth is configured
- **Secure** with proper separation between dev and prod modes
- **Well-documented** with clear instructions

You can now develop and test the application without any additional authentication setup.
