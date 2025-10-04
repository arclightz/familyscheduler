import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminService } from '@/features/admin/service';

const adminService = new AdminService();

/**
 * GET /api/admin/users/[id]/activity
 * Get user activity summary (admin only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check

    const { id: userId } = await params;
    const { searchParams } = new URL(req.url);
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30;

    const activity = await adminService.getUserActivity(userId, days);

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json({ error: 'Failed to fetch user activity' }, { status: 500 });
  }
}
