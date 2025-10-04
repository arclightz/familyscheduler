import { NextResponse } from 'next/server';
import { jobScheduler } from '@/features/jobs/scheduler';
import { requireAuth } from '@/lib/auth-helpers';

/**
 * POST /api/admin/jobs/trigger
 * Manually trigger weekly plan generation
 */
export async function POST() {
  try {
    // Require authentication (add admin check in production)
    await requireAuth();

    await jobScheduler.triggerWeeklyPlans();

    return NextResponse.json({
      success: true,
      message: 'Weekly plan generation triggered successfully',
    });
  } catch (error) {
    console.error('Error triggering jobs:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to trigger jobs' },
      { status: 500 }
    );
  }
}
