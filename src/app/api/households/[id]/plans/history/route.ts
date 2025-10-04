import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireHouseholdMember } from '@/lib/auth-helpers';

/**
 * GET /api/households/:id/plans/history
 * Get plan history for a household (published plans only)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: householdId } = await params;

    // Verify household membership
    await requireHouseholdMember(householdId);

    const plans = await prisma.plan.findMany({
      where: {
        household_id: householdId,
        status: { in: ['published', 'archived'] },
      },
      include: {
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: {
        week_start: 'desc',
      },
      take: 52, // Last year of plans
    });

    const history = plans.map((plan) => ({
      plan_id: plan.plan_id,
      week_start: plan.week_start,
      status: plan.status,
      version: plan.version,
      published_at: plan.published_at,
      published_by: plan.published_by,
      assignments_count: plan._count.assignments,
      created_at: plan.created_at,
    }));

    return NextResponse.json({ plans: history });
  } catch (error) {
    console.error('Error fetching plan history:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch plan history' },
      { status: 500 }
    );
  }
}
