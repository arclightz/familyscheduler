import { NextRequest, NextResponse } from 'next/server';
import { CalendarConnectionService } from '@/features/calendars/calendar-service';

/**
 * Handle Google Calendar OAuth callback
 * GET /api/calendar/connect/google/callback?code=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/profile?error=google_auth_failed`, request.url)
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code not provided' },
        { status: 400 }
      );
    }

    // TODO: Get user ID from session (NextAuth)
    // For now, using demo user
    const userId = 'user-1';

    await CalendarConnectionService.connectGoogle(userId, code);

    // Redirect to profile page with success message
    return NextResponse.redirect(
      new URL('/profile?calendar_connected=google', request.url)
    );
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    return NextResponse.redirect(
      new URL('/profile?error=google_connection_failed', request.url)
    );
  }
}
