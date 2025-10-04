import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateAssignmentSchema, AssignmentSchema, IdSchema } from '@/lib/schemas';
import {
  apiSuccessResponse,
  handleApiError,
  validateRequestBody,
  createApiError,
  apiErrorResponse,
} from '@/lib/api-utils';
import { updateAssignmentStatus } from '@/features/plans/service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: assignmentId, error } = validateParams(await params);
    if (error) return error;

    const assignment = await prisma.assignment.findUnique({
      where: { assignment_id: assignmentId },
      include: {
        task: true,
        user: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
        plan: {
          select: {
            plan_id: true,
            week_start: true,
            status: true,
          },
        },
      },
    });

    if (!assignment) {
      const error = createApiError('NOT_FOUND', 'Assignment not found');
      return apiErrorResponse(error, 404);
    }

    return apiSuccessResponse(assignment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: assignmentId, error: paramsError } = validateParams(await params);
    if (paramsError) return paramsError;

    const { data: body, error } = await validateRequestBody(
      request,
      UpdateAssignmentSchema
    );
    if (error) return error;

    // Check if assignment exists
    const existingAssignment = await prisma.assignment.findUnique({
      where: { assignment_id: assignmentId },
    });

    if (!existingAssignment) {
      const error = createApiError('NOT_FOUND', 'Assignment not found');
      return apiErrorResponse(error, 404);
    }

    // Handle status updates with gamification
    if (body.status) {
      await updateAssignmentStatus(
        assignmentId,
        body.status,
        body.notes || undefined
      );
    }

    // Update other fields if provided
    const updateData: {
      start_at?: Date;
      end_at?: Date;
      notes?: string | null;
    } = {};
    if (body.start_at) updateData.start_at = body.start_at;
    if (body.end_at) updateData.end_at = body.end_at;
    if (body.notes !== undefined && !body.status) updateData.notes = body.notes;

    if (Object.keys(updateData).length > 0) {
      await prisma.assignment.update({
        where: { assignment_id: assignmentId },
        data: updateData,
      });
    }

    // Fetch updated assignment
    const assignment = await prisma.assignment.findUnique({
      where: { assignment_id: assignmentId },
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
    });

    return apiSuccessResponse(assignment);
  } catch (error) {
    return handleApiError(error);
  }
}

function validateParams(params: { id: string }) {
  try {
    const id = IdSchema.parse(params.id);
    return { data: id, error: null };
  } catch {
    const error = createApiError('INVALID_ID', 'Invalid assignment ID');
    return { data: null, error: apiErrorResponse(error, 400) };
  }
}