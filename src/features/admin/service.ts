import { prisma } from '@/lib/prisma';
import type { CreateAuditLogInput, SystemMetrics, HouseholdStats } from './types';

export class AdminService {
  /**
   * Create an audit log entry
   */
  async createAuditLog(input: CreateAuditLogInput) {
    return prisma.auditLog.create({
      data: {
        ...input,
        changes: input.changes as any,
      },
    });
  }

  /**
   * Get audit logs with optional filters
   */
  async getAuditLogs(filters?: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const { userId, entityType, entityId, startDate, endDate, limit = 100 } = filters || {};

    return prisma.auditLog.findMany({
      where: {
        ...(userId && { user_id: userId }),
        ...(entityType && { entity_type: entityType }),
        ...(entityId && { entity_id: entityId }),
        ...(startDate || endDate
          ? {
              created_at: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            }
          : {}),
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  /**
   * Get system-wide metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const [
      totalUsers,
      totalHouseholds,
      totalTasks,
      totalPlans,
      activePlans,
      completedToday,
      completedWeek,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.household.count(),
      prisma.task.count({ where: { active: true } }),
      prisma.plan.count(),
      prisma.plan.count({ where: { status: 'published' } }),
      prisma.assignment.count({
        where: {
          status: 'done',
          end_at: { gte: today },
        },
      }),
      prisma.assignment.count({
        where: {
          status: 'done',
          end_at: { gte: weekStart },
        },
      }),
    ]);

    return {
      total_users: totalUsers,
      total_households: totalHouseholds,
      total_tasks: totalTasks,
      total_plans: totalPlans,
      active_plans: activePlans,
      completed_assignments_today: completedToday,
      completed_assignments_week: completedWeek,
    };
  }

  /**
   * Get statistics for all households
   */
  async getHouseholdStats(): Promise<HouseholdStats[]> {
    const households = await prisma.household.findMany({
      include: {
        members: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
        tasks: { where: { active: true } },
        plans: {
          where: { status: 'published' },
          include: { assignments: true },
        },
      },
    });

    return households.map((household) => {
      const totalAssignments = household.plans.reduce((sum, plan) => {
        return sum + plan.assignments.length;
      }, 0);

      const completedAssignments = household.plans.reduce((sum, plan) => {
        const completed = plan.assignments.filter((a) => a.status === 'done').length;
        return sum + completed;
      }, 0);

      const completionRate =
        totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

      const totalXp = household.members.reduce((sum, member) => {
        return sum + (member.user.profile?.xp || 0);
      }, 0);

      const avgXp = household.members.length > 0 ? totalXp / household.members.length : 0;

      return {
        household_id: household.household_id,
        household_name: household.name,
        member_count: household.members.length,
        task_count: household.tasks.length,
        active_plan_count: household.plans.length,
        completion_rate: Math.round(completionRate * 10) / 10,
        avg_xp_per_member: Math.round(avgXp),
      };
    });
  }

  /**
   * Get user activity summary
   */
  async getUserActivity(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [assignments, auditLogs] = await Promise.all([
      prisma.assignment.findMany({
        where: {
          user_id: userId,
          start_at: { gte: startDate },
        },
        include: { task: true },
        orderBy: { start_at: 'desc' },
      }),
      prisma.auditLog.findMany({
        where: {
          user_id: userId,
          created_at: { gte: startDate },
        },
        orderBy: { created_at: 'desc' },
        take: 50,
      }),
    ]);

    return {
      assignments,
      audit_logs: auditLogs,
      summary: {
        total_assignments: assignments.length,
        completed: assignments.filter((a) => a.status === 'done').length,
        pending: assignments.filter((a) => a.status === 'pending').length,
        skipped: assignments.filter((a) => a.status === 'skipped').length,
        audit_count: auditLogs.length,
      },
    };
  }

  /**
   * Delete old audit logs (cleanup)
   */
  async cleanupOldAuditLogs(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return prisma.auditLog.deleteMany({
      where: {
        created_at: { lt: cutoffDate },
      },
    });
  }
}
