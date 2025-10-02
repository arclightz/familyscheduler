import { NextRequest, NextResponse } from 'next/server';
import { ZodError, z } from 'zod';
import { ApiError, ApiErrorResponseSchema } from './schemas';

export function createApiError(
  code: string,
  message: string,
  details?: unknown
): ApiError {
  return { code, message, details };
}

export function apiErrorResponse(error: ApiError, status = 400) {
  return NextResponse.json({ error, success: false }, { status });
}

export function apiSuccessResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data, success: true }, { status });
}

export function paginatedApiResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  status = 200
) {
  return NextResponse.json(
    {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    },
    { status }
  );
}

export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      const apiError = createApiError(
        'VALIDATION_ERROR',
        'Invalid request body',
        error.issues
      );
      return { data: null, error: apiErrorResponse(apiError, 400) };
    }

    const apiError = createApiError(
      'INVALID_JSON',
      'Request body must be valid JSON'
    );
    return { data: null, error: apiErrorResponse(apiError, 400) };
  }
}

export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { data: T; error: null } | { data: null; error: NextResponse } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      const apiError = createApiError(
        'VALIDATION_ERROR',
        'Invalid query parameters',
        error.issues
      );
      return { data: null, error: apiErrorResponse(apiError, 400) };
    }

    const apiError = createApiError(
      'INVALID_PARAMS',
      'Invalid query parameters'
    );
    return { data: null, error: apiErrorResponse(apiError, 400) };
  }
}

export async function handleApiError(error: unknown): Promise<NextResponse> {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    const apiError = createApiError(
      'VALIDATION_ERROR',
      'Validation failed',
      error.issues
    );
    return apiErrorResponse(apiError, 400);
  }

  // Handle known error types here (Prisma errors, etc.)

  const apiError = createApiError(
    'INTERNAL_ERROR',
    'An unexpected error occurred'
  );
  return apiErrorResponse(apiError, 500);
}