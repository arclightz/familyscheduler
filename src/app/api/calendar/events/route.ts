import { NextRequest, NextResponse } from 'next/server';
import { CalendarConnectionService } from '@/features/calendars/calendar-service';

/**
 * Fetch calendar events for a user
 * GET /api/calendar/events?user_id=...&start=...&end=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: 'start and end dates are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(startParam);
    const endDate = new Date(endParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const events = await CalendarConnectionService.fetchUserEvents(
      userId,
      startDate,
      endDate
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
