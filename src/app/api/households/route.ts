import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateHouseholdSchema, HouseholdSchema } from '@/lib/schemas';
import {
  apiSuccessResponse,
  handleApiError,
  validateRequestBody,
} from '@/lib/api-utils';

export async function GET() {
  try {
    const households = await prisma.household.findMany({
      orderBy: { created_at: 'desc' },
    });

    const parsedHouseholds = households.map((household) =>
      HouseholdSchema.parse(household)
    );

    return apiSuccessResponse(parsedHouseholds);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await validateRequestBody(
      request,
      CreateHouseholdSchema
    );
    if (error) return error;

    const household = await prisma.household.create({
      data: {
        name: body.name,
      },
    });

    const parsedHousehold = HouseholdSchema.parse(household);
    return apiSuccessResponse(parsedHousehold, 201);
  } catch (error) {
    return handleApiError(error);
  }
}