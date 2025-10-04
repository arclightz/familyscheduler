import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

/**
 * Get the current authenticated user's session from server components
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Get the current user's household memberships
 */
export async function getCurrentUserHouseholds() {
  const user = await getCurrentUser();
  if (!user?.id) return [];

  const memberships = await prisma.householdMember.findMany({
    where: { user_id: user.id },
    include: {
      household: true,
      user: {
        select: {
          user_id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return memberships;
}

/**
 * Get the primary household for the current user (first one)
 */
export async function getCurrentUserPrimaryHousehold() {
  const households = await getCurrentUserHouseholds();
  return households[0] ?? null;
}

/**
 * Check if the current user is a member of a specific household
 */
export async function isHouseholdMember(householdId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user?.id) return false;

  const membership = await prisma.householdMember.findFirst({
    where: {
      household_id: householdId,
      user_id: user.id,
    },
  });

  return !!membership;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Require household membership - throws if not a member
 */
export async function requireHouseholdMember(householdId: string) {
  const user = await requireAuth();
  const isMember = await isHouseholdMember(householdId);

  if (!isMember) {
    throw new Error('Forbidden: Not a member of this household');
  }

  return user;
}
