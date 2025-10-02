import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HouseholdSchema, IdSchema } from '@/lib/schemas';
import {
  apiSuccessResponse,
  handleApiError,
  createApiError,
  apiErrorResponse,
} from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: householdId, error } = validateParams(await params);
    if (error) return error;

    const household = await prisma.household.findUnique({
      where: { household_id: householdId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        tasks: {
          where: { active: true },
        },
        plans: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
      },
    });

    if (!household) {
      const error = createApiError('NOT_FOUND', 'Household not found');
      return apiErrorResponse(error, 404);
    }

    return apiSuccessResponse(household);
  } catch (error) {
    return handleApiError(error);
  }
}

function validateParams(params: { id: string }) {
  try {
    const id = IdSchema.parse(params.id);
    return { data: id, error: null };
  } catch {
    const error = createApiError('INVALID_ID', 'Invalid household ID');
    return { data: null, error: apiErrorResponse(error, 400) };
  }
}