import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreatePlanSchema, PlanSchema, IdSchema } from '@/lib/schemas';
import {
  apiSuccessResponse,
  handleApiError,
  validateRequestBody,
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

    const plans = await prisma.plan.findMany({
      where: { household_id: householdId },
      include: {
        assignments: {
          include: {
            task: true,
            user: {
              select: {
                user_id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { week_start: 'desc' },
      take: 10,
    });

    return apiSuccessResponse(plans);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: householdId, error: paramsError } = validateParams(await params);
    if (paramsError) return paramsError;

    const { data: body, error } = await validateRequestBody(
      request,
      CreatePlanSchema
    );
    if (error) return error;

    // Verify household exists
    const household = await prisma.household.findUnique({
      where: { household_id: householdId },
    });

    if (!household) {
      const error = createApiError('NOT_FOUND', 'Household not found');
      return apiErrorResponse(error, 404);
    }

    // Check if a plan already exists for this week
    const existingPlan = await prisma.plan.findFirst({
      where: {
        household_id: householdId,
        week_start: body.week_start,
      },
    });

    if (existingPlan) {
      const error = createApiError(
        'PLAN_EXISTS',
        'A plan already exists for this week'
      );
      return apiErrorResponse(error, 409);
    }

    const plan = await prisma.plan.create({
      data: {
        household_id: householdId,
        week_start: body.week_start,
        status: 'draft',
      },
    });

    const parsedPlan = PlanSchema.parse(plan);
    return apiSuccessResponse(parsedPlan, 201);
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