import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminService } from '@/features/admin/service';

const adminService = new AdminService();

/**
 * GET /api/admin/households
 * Get all household statistics (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check

    const households = await adminService.getHouseholdStats();

    return NextResponse.json({ households });
  } catch (error) {
    console.error('Error fetching household stats:', error);
    return NextResponse.json({ error: 'Failed to fetch household stats' }, { status: 500 });
  }
}
