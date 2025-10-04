import { NextRequest } from 'next/server';
import { AdminService } from './service';
import type { CreateAuditLogInput } from './types';

const adminService = new AdminService();

/**
 * Helper to create audit log from request
 */
export async function createAuditLog(
  req: NextRequest,
  userId: string,
  action: CreateAuditLogInput['action'],
  entityType: CreateAuditLogInput['entity_type'],
  entityId: string,
  changes: Record<string, any>
) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
  const userAgent = req.headers.get('user-agent') || undefined;

  return adminService.createAuditLog({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    changes,
    ip_address: ip,
    user_agent: userAgent,
  });
}

/**
 * Audit decorator for plan operations
 */
export function withPlanAudit(
  action: 'create' | 'update' | 'delete' | 'publish'
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      // Audit logic would go here
      // This is a placeholder for demonstration

      return result;
    };

    return descriptor;
  };
}
