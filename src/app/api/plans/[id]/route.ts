import { NextRequest } from 'next/server';
import { IdSchema } from '@/lib/schemas';
import {
  apiSuccessResponse,
  handleApiError,
  createApiError,
  apiErrorResponse,
} from '@/lib/api-utils';
import { getPlanWithAssignments } from '@/features/plans/service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: planId, error } = validateParams(await params);
    if (error) return error;

    const plan = await getPlanWithAssignments(planId);

    if (!plan) {
      const error = createApiError('NOT_FOUND', 'Plan not found');
      return apiErrorResponse(error, 404);
    }

    return apiSuccessResponse(plan);
  } catch (error) {
    return handleApiError(error);
  }
}

function validateParams(params: { id: string }) {
  try {
    const id = IdSchema.parse(params.id);
    return { data: id, error: null };
  } catch {
    const error = createApiError('INVALID_ID', 'Invalid plan ID');
    return { data: null, error: apiErrorResponse(error, 400) };
  }
}
