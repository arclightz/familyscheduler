import { NextRequest, NextResponse } from 'next/server';
import { CalendarConnectionService } from '@/features/calendars/calendar-service';

/**
 * Handle Microsoft Calendar OAuth callback
 * GET /api/calendar/connect/microsoft/callback?code=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/profile?error=microsoft_auth_failed`, request.url)
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

    await CalendarConnectionService.connectMicrosoft(userId, code);

    // Redirect to profile page with success message
    return NextResponse.redirect(
      new URL('/profile?calendar_connected=microsoft', request.url)
    );
  } catch (error) {
    console.error('Microsoft Calendar callback error:', error);
    return NextResponse.redirect(
      new URL('/profile?error=microsoft_connection_failed', request.url)
    );
  }
}
