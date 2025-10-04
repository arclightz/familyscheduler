import { NextResponse } from 'next/server';
import { createGoogleCalendarService } from '@/features/calendars/google-calendar';

/**
 * Initiate Google Calendar OAuth flow
 * GET /api/calendar/connect/google
 */
export async function GET() {
  try {
    const googleService = createGoogleCalendarService();
    const authUrl = googleService.getAuthUrl();

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Failed to generate Google auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google Calendar connection' },
      { status: 500 }
    );
  }
}
