import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationService } from '@/features/notifications/service';
import { z } from 'zod';

const notificationService = new NotificationService();

const UpdateReminderSchema = z.object({
  enabled: z.boolean().optional(),
  time: z.string().optional(),
  offset_min: z.number().optional(),
  channels: z.array(z.enum(['push', 'email'])).optional(),
});

/**
 * PATCH /api/reminders/[id]
 * Update a reminder schedule
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const scheduleId = id;
    const body = await req.json();
    const validated = UpdateReminderSchema.parse(body);

    const schedule = await notificationService.updateReminderSchedule(scheduleId, validated);

    return NextResponse.json({ schedule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error updating reminder schedule:', error);
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}

/**
 * DELETE /api/reminders/[id]
 * Delete a reminder schedule
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const scheduleId = id;
    await notificationService.deleteReminderSchedule(scheduleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder schedule:', error);
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}
