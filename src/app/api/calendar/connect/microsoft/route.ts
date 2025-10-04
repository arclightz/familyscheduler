import { NextResponse } from 'next/server';
import { createMicrosoftCalendarService } from '@/features/calendars/microsoft-calendar';

/**
 * Initiate Microsoft Calendar OAuth flow
 * GET /api/calendar/connect/microsoft
 */
export async function GET() {
  try {
    const msService = createMicrosoftCalendarService();
    const authUrl = msService.getAuthUrl();

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Failed to generate Microsoft auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Microsoft Calendar connection' },
      { status: 500 }
    );
  }
}
