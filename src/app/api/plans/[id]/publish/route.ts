import { NextRequest } from 'next/server';
import { IdSchema } from '@/lib/schemas';
import {
  apiSuccessResponse,
  handleApiError,
  createApiError,
  apiErrorResponse,
} from '@/lib/api-utils';
import { publishPlan } from '@/features/plans/service';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: planId, error } = validateParams(await params);
    if (error) return error;

    await publishPlan(planId);

    return apiSuccessResponse({ message: 'Plan published successfully' });
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
