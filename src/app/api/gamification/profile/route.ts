import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GamificationProfileSchema, IdSchema } from '@/lib/schemas';
import {
  apiSuccessResponse,
  handleApiError,
  validateQueryParams,
  createApiError,
  apiErrorResponse,
} from '@/lib/api-utils';
import { z } from 'zod';

const GetProfileSchema = z.object({
  user_id: IdSchema,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { data: query, error } = validateQueryParams(
      searchParams,
      GetProfileSchema
    );
    if (error) return error;

    let profile = await prisma.gamificationProfile.findUnique({
      where: { user_id: query.user_id },
      include: {
        badges: {
          include: {
            badge: true,
          },
          orderBy: { earned_at: 'desc' },
        },
        progress: true,
      },
    });

    // Create profile if it doesn't exist
    if (!profile) {
      profile = await prisma.gamificationProfile.create({
        data: {
          user_id: query.user_id,
          xp: 0,
          level: 1,
          streak_days: 0,
        },
        include: {
          badges: {
            include: {
              badge: true,
            },
          },
          progress: true,
        },
      });
    }

    return apiSuccessResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}