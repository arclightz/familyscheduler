import { NextRequest, NextResponse } from 'next/server';
import { CalendarConnectionService } from '@/features/calendars/calendar-service';

/**
 * Get all calendar connections for a user
 * GET /api/calendar/connections?user_id=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    const connections = await CalendarConnectionService.getUserConnections(userId);

    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Failed to fetch calendar connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar connections' },
      { status: 500 }
    );
  }
}

/**
 * Disconnect a calendar
 * DELETE /api/calendar/connections
 * Body: { connection_id: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { connection_id } = body;

    if (!connection_id) {
      return NextResponse.json(
        { error: 'connection_id is required' },
        { status: 400 }
      );
    }

    await CalendarConnectionService.disconnect(connection_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect calendar' },
      { status: 500 }
    );
  }
}
