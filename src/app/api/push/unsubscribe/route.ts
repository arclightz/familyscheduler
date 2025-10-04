import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationService } from '@/features/notifications/service';
import { z } from 'zod';

const notificationService = new NotificationService();

const UnsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

/**
 * POST /api/push/unsubscribe
 * Unsubscribe from push notifications
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = UnsubscribeSchema.parse(body);

    await notificationService.unsubscribeFromPush(validated.endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error unsubscribing from push:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
