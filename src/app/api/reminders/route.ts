import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationService } from '@/features/notifications/service';
import { z } from 'zod';

const notificationService = new NotificationService();

const ReminderScheduleSchema = z.object({
  task_id: z.string().optional(),
  frequency: z.enum(['daily', 'before_task', 'weekly_summary']),
  time: z.string().optional(),
  offset_min: z.number().optional(),
  channels: z.array(z.enum(['push', 'email'])),
});

/**
 * GET /api/reminders
 * Get user's reminder schedules
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const schedules = await notificationService.getReminderSchedules(userId);

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching reminder schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

/**
 * POST /api/reminders
 * Create a new reminder schedule
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const validated = ReminderScheduleSchema.parse(body);

    const schedule = await notificationService.createReminderSchedule({
      user_id: userId,
      ...validated,
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error creating reminder schedule:', error);
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}
