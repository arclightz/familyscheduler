import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateTaskSchema, TaskSchema, IdSchema } from '@/lib/schemas';
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

    const tasks = await prisma.task.findMany({
      where: {
        household_id: householdId,
        active: true,
      },
      orderBy: { name: 'asc' },
    });

    const parsedTasks = tasks.map((task) => ({
      ...task,
      frequency: task.frequency as any,
      time_windows: task.time_windows as any,
      constraints: task.constraints as any,
      rotation_roster: task.rotation_roster as string[],
    }));

    return apiSuccessResponse(parsedTasks);
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
      CreateTaskSchema
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

    const task = await prisma.task.create({
      data: {
        household_id: householdId,
        name: body.name,
        description: body.description || null,
        category: body.category || null,
        duration_min: body.duration_min,
        frequency: body.frequency,
        time_windows: body.time_windows || undefined,
        constraints: body.constraints || undefined,
        fairness_weight: body.fairness_weight,
        rotation_roster: body.rotation_roster,
      },
    });

    const parsedTask = {
      ...task,
      frequency: task.frequency as any,
      time_windows: task.time_windows as any,
      constraints: task.constraints as any,
      rotation_roster: task.rotation_roster as string[],
    };

    return apiSuccessResponse(parsedTask, 201);
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