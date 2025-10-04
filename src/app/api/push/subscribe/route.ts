import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationService } from '@/features/notifications/service';
import { z } from 'zod';

const notificationService = new NotificationService();

const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  user_agent: z.string().optional(),
});

/**
 * POST /api/push/subscribe
 * Subscribe to push notifications
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const validated = PushSubscriptionSchema.parse(body);

    const subscription = await notificationService.subscribeToPush({
      user_id: userId,
      ...validated,
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error subscribing to push:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
