# Calendar Integration Documentation

## Overview

The Family Task Scheduler now supports calendar integration with **Google Calendar** and **Microsoft Calendar** (Outlook). This allows the scheduling engine to automatically avoid assigning tasks when family members are busy or away.

## Features

- ✅ OAuth 2.0 authentication for Google and Microsoft
- ✅ Automatic token refresh
- ✅ Event fetching for date ranges
- ✅ Unified calendar event format
- ✅ User-friendly connection UI in profile page
- ✅ Multiple calendar support per user

## Architecture

### Core Components

1. **Google Calendar Service** (`src/features/calendars/google-calendar.ts`)
   - OAuth flow using googleapis
   - Event fetching with filtering
   - Token management and refresh

2. **Microsoft Calendar Service** (`src/features/calendars/microsoft-calendar.ts`)
   - OAuth flow using Microsoft Graph API
   - Event fetching with Graph client
   - Token management and refresh

3. **Calendar Connection Service** (`src/features/calendars/calendar-service.ts`)
   - Unified interface for both providers
   - Database storage for connections
   - Automatic token refresh
   - Multi-calendar event aggregation

4. **UI Components** (`src/components/calendar/CalendarConnections.tsx`)
   - Connect/disconnect calendars
   - Display connected accounts
   - OAuth flow initiation

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calendar/connect/google` | GET | Initiate Google OAuth flow |
| `/api/calendar/connect/google/callback` | GET | Handle Google OAuth callback |
| `/api/calendar/connect/microsoft` | GET | Initiate Microsoft OAuth flow |
| `/api/calendar/connect/microsoft/callback` | GET | Handle Microsoft OAuth callback |
| `/api/calendar/connections` | GET | List user's calendar connections |
| `/api/calendar/connections` | DELETE | Disconnect a calendar |
| `/api/calendar/events` | GET | Fetch events from connected calendars |

## Setup Instructions

### 1. Google Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google Calendar API**
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/calendar/connect/google/callback`
5. Copy Client ID and Client Secret to `.env`:

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 2. Microsoft Calendar Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Create a new registration:
   - Name: Family Task Scheduler
   - Supported account types: Accounts in any organizational directory and personal Microsoft accounts
   - Redirect URI: `http://localhost:3000/api/calendar/connect/microsoft/callback`
4. Go to **Certificates & secrets** → Create new client secret
5. Go to **API permissions** → Add permissions:
   - Microsoft Graph → Delegated permissions:
     - `Calendars.Read`
     - `User.Read`
     - `offline_access`
6. Copy Application (client) ID and secret to `.env`:

```env
MICROSOFT_CLIENT_ID="your-application-id"
MICROSOFT_CLIENT_SECRET="your-client-secret"
MICROSOFT_TENANT_ID="common"  # or your specific tenant ID
```

### 3. Application Configuration

Update your `.env` file with:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-string"
```

Generate a secret with:
```bash
openssl rand -base64 32
```

## Usage

### Connecting a Calendar

1. Navigate to `/profile` page
2. Scroll to "Calendar Integrations" section
3. Click "Connect" on Google Calendar or Microsoft Calendar
4. Complete OAuth authorization flow
5. Calendar will show as "Connected" with account email

### Disconnecting a Calendar

1. Go to `/profile` page
2. Find the connected calendar
3. Click "Disconnect" button
4. Confirm the action

### Fetching Events

The scheduler automatically fetches events when generating plans. Manual fetching:

```typescript
import { CalendarConnectionService } from '@/features/calendars/calendar-service';

const events = await CalendarConnectionService.fetchUserEvents(
  'user-id',
  new Date('2025-10-07'),  // start date
  new Date('2025-10-14')   // end date
);

console.log(events);
// [
//   {
//     id: 'event-123',
//     provider: 'google',
//     title: 'Team Meeting',
//     start_at: Date,
//     end_at: Date,
//     is_all_day: false,
//     description: 'Weekly sync'
//   },
//   ...
// ]
```

## Integration with Scheduler

The calendar events are used by the scheduling engine to:

1. Build member availability grids
2. Exclude busy time slots from task assignment
3. Detect away periods (all-day events like "Vacation")
4. Add buffer time (15 minutes) around events

See `src/features/plans/scheduler.ts` for implementation.

## Data Model

### CalendarConnection

```prisma
model CalendarConnection {
  id         String   @id @default(cuid())
  user       User     @relation(fields: [user_id], references: [user_id])
  user_id    String
  provider   String   // google | microsoft
  account_id String
  access     Json     // encrypted tokens
}
```

### CalendarEvent (TypeScript Interface)

```typescript
interface CalendarEvent {
  id: string;
  provider: 'google' | 'microsoft';
  title: string;
  start_at: Date;
  end_at: Date;
  is_all_day: boolean;
  description?: string;
}
```

## Security Considerations

### Token Storage

⚠️ **Important**: The current implementation stores tokens in the database **without encryption**. Before production:

1. Implement token encryption using a library like `@47ng/simple-e2ee` or similar
2. Store encryption keys securely (environment variable or key management service)
3. Update `encryptTokens()` and `decryptTokens()` in `calendar-service.ts`

```typescript
// TODO: Production implementation
import { encrypt, decrypt } from '@47ng/simple-e2ee';

function encryptTokens(tokens: any): any {
  const key = process.env.ENCRYPTION_KEY!;
  return encrypt(JSON.stringify(tokens), key);
}

function decryptTokens(encrypted: any): any {
  const key = process.env.ENCRYPTION_KEY!;
  return JSON.parse(decrypt(encrypted, key));
}
```

### OAuth Scopes

- **Google**: `calendar.readonly` and `userinfo.email` (minimal required)
- **Microsoft**: `Calendars.Read`, `User.Read`, `offline_access`

Never request more permissions than necessary.

### Token Refresh

Both services automatically refresh expired tokens:
- Google: Uses refresh token when `expiry_date` is past
- Microsoft: Uses refresh token when `expires_at` is past

Refresh failures will result in the user needing to re-authenticate.

## Testing

### Manual Testing Checklist

- [ ] Connect Google Calendar - verify OAuth flow
- [ ] Connect Microsoft Calendar - verify OAuth flow
- [ ] View connected calendars in profile
- [ ] Disconnect calendar - verify removal
- [ ] Fetch events for current week
- [ ] Verify events appear in scheduler availability
- [ ] Test token refresh (mock expired token)
- [ ] Test error handling (deny OAuth consent)

### Mock Data Testing

For testing without real OAuth credentials, create a mock service:

```typescript
// src/features/calendars/__mocks__/mock-calendar-service.ts
export class MockCalendarService {
  static async fetchUserEvents(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    return [
      {
        id: 'mock-1',
        provider: 'google' as const,
        title: 'Mock Meeting',
        start_at: new Date('2025-10-07T10:00:00'),
        end_at: new Date('2025-10-07T11:00:00'),
        is_all_day: false,
      },
    ];
  }
}
```

## Troubleshooting

### "Failed to generate Google auth URL"

- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Verify redirect URI in Google Cloud Console matches your app URL

### "Failed to connect Microsoft Calendar"

- Verify `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` are set
- Check tenant ID is "common" for personal accounts
- Ensure API permissions are granted in Azure Portal

### "No events returned"

- Verify calendar has events in the requested date range
- Check token hasn't expired (should auto-refresh)
- Inspect browser console for error messages

### "Token refresh failed"

- User needs to disconnect and reconnect calendar
- Check refresh token was stored correctly
- Verify OAuth scopes include `offline_access` (Microsoft)

## Future Enhancements

- [ ] Support for additional providers (Apple Calendar, CalDAV)
- [ ] Webhook integration for real-time event updates
- [ ] Calendar event creation (two-way sync)
- [ ] Shared family calendar view
- [ ] Calendar-based automatic task rescheduling
- [ ] Conflict resolution UI
- [ ] Calendar event categories/filtering

## References

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Microsoft Graph Calendar API](https://docs.microsoft.com/en-us/graph/api/resources/calendar)
- [OAuth 2.0 Best Practices](https://oauth.net/2/)
- [Prisma JSON Fields](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#json)
