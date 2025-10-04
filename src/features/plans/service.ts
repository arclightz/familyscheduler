/**
 * Plan Service - Business logic for plan generation and management
 */

import { prisma } from '@/lib/prisma';
import {
  generateSchedule,
  buildMemberAvailability,
  type SchedulingContext,
  type SchedulingResult,
  type AssignmentCandidate,
} from './scheduler';
import type { CalendarEvent } from '@/lib/schemas';

// ============================================================================
// Plan Generation
// ============================================================================

export interface GeneratePlanOptions {
  household_id: string;
  week_start: Date;
  calendar_events?: Map<string, CalendarEvent[]>;
}

export interface GeneratePlanResult {
  plan_id: string;
  status: 'draft' | 'published';
  assignments_count: number;
  unassigned_count: number;
  conflicts: string[];
}

/**
 * Generate a new weekly plan (draft status)
 */
export async function generateWeeklyPlan(
  options: GeneratePlanOptions
): Promise<GeneratePlanResult> {
  const { household_id, week_start, calendar_events = new Map() } = options;

  // Fetch household data
  const household = await prisma.household.findUnique({
    where: { household_id },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      tasks: {
        where: { active: true },
      },
    },
  });

  if (!household) {
    throw new Error(`Household ${household_id} not found`);
  }

  // Get fairness history (last 4 weeks)
  const fairnessHistory = await calculateFairnessHistory(
    household_id,
    week_start,
    4
  );

  // Build scheduling context
  const context: SchedulingContext = {
    week_start,
    tasks: household.tasks.map((task) => ({
      ...task,
      frequency: task.frequency as any,
      time_windows: task.time_windows as any,
      constraints: task.constraints as any,
      rotation_roster: task.rotation_roster as any,
    })),
    members: household.members.map((m) => ({
      id: m.id,
      household_id: m.household_id,
      user_id: m.user_id,
      role: m.role,
      capabilities: Array.isArray(m.capabilities)
        ? m.capabilities
        : JSON.parse(String(m.capabilities || '[]')),
      allergies: Array.isArray(m.allergies)
        ? m.allergies
        : JSON.parse(String(m.allergies || '[]')),
    })),
    calendar_events,
    fairness_history: fairnessHistory,
  };

  // Run scheduling algorithm
  const result = generateSchedule(context);

  // Create plan in database
  const plan = await prisma.plan.create({
    data: {
      household_id,
      week_start,
      status: 'draft',
    },
  });

  // Create assignments
  await createAssignments(plan.plan_id, result);

  return {
    plan_id: plan.plan_id,
    status: 'draft',
    assignments_count: result.assignments.length,
    unassigned_count: result.unassigned.length,
    conflicts: result.conflicts,
  };
}

/**
 * Publish a draft plan
 */
export async function publishPlan(plan_id: string): Promise<void> {
  const plan = await prisma.plan.findUnique({
    where: { plan_id },
  });

  if (!plan) {
    throw new Error(`Plan ${plan_id} not found`);
  }

  if (plan.status === 'published') {
    throw new Error('Plan is already published');
  }

  await prisma.plan.update({
    where: { plan_id },
    data: { status: 'published' },
  });
}

/**
 * Get plan with all assignments
 */
export async function getPlanWithAssignments(plan_id: string) {
  return prisma.plan.findUnique({
    where: { plan_id },
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
        orderBy: { start_at: 'asc' },
      },
      household: {
        select: {
          household_id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Update assignment status (complete, skip)
 */
export async function updateAssignmentStatus(
  assignment_id: string,
  status: 'pending' | 'done' | 'skipped',
  notes?: string
): Promise<void> {
  await prisma.assignment.update({
    where: { assignment_id },
    data: {
      status,
      ...(notes && { notes }),
    },
  });

  // If marked as done, update gamification profile
  if (status === 'done') {
    const assignment = await prisma.assignment.findUnique({
      where: { assignment_id },
      include: { task: true },
    });

    if (assignment) {
      await updateGamificationOnCompletion(assignment);
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate fairness history for members
 */
async function calculateFairnessHistory(
  household_id: string,
  currentWeekStart: Date,
  weeksBack = 4
): Promise<Map<string, number>> {
  const startDate = new Date(currentWeekStart);
  startDate.setDate(startDate.getDate() - weeksBack * 7);

  const plans = await prisma.plan.findMany({
    where: {
      household_id,
      week_start: {
        gte: startDate,
        lt: currentWeekStart,
      },
      status: 'published',
    },
    include: {
      assignments: {
        where: { status: 'done' },
        include: { task: true },
      },
    },
  });

  const scores = new Map<string, number>();

  for (const plan of plans) {
    for (const assignment of plan.assignments) {
      const current = scores.get(assignment.user_id) || 0;
      const score =
        assignment.task.duration_min * assignment.task.fairness_weight;
      scores.set(assignment.user_id, current + score);
    }
  }

  return scores;
}

/**
 * Create assignments in database
 */
async function createAssignments(
  plan_id: string,
  result: SchedulingResult
): Promise<void> {
  if (result.assignments.length === 0) return;

  const data = result.assignments.map((a: AssignmentCandidate) => ({
    plan_id,
    task_id: a.task_instance.task_id,
    user_id: a.user_id,
    member_id: a.member_id,
    start_at: a.start_at,
    end_at: a.end_at,
    status: 'pending' as const,
  }));

  await prisma.assignment.createMany({ data });
}

/**
 * Update gamification profile when task is completed
 */
async function updateGamificationOnCompletion(assignment: {
  user_id: string;
  task: { duration_min: number; fairness_weight: number };
}): Promise<void> {
  // Calculate XP: duration_min * fairness_weight / 10
  const xpGain = Math.round(
    (assignment.task.duration_min * assignment.task.fairness_weight) / 10
  );

  // Get or create profile
  let profile = await prisma.gamificationProfile.findUnique({
    where: { user_id: assignment.user_id },
  });

  if (!profile) {
    profile = await prisma.gamificationProfile.create({
      data: {
        user_id: assignment.user_id,
        xp: 0,
        level: 1,
        streak_days: 0,
      },
    });
  }

  const newXp = profile.xp + xpGain;

  // Calculate new level
  const newLevel = await calculateLevel(newXp);

  // Update streak
  const newStreakDays = await updateStreak(
    profile.user_id,
    profile.last_action
  );

  await prisma.gamificationProfile.update({
    where: { user_id: assignment.user_id },
    data: {
      xp: newXp,
      level: newLevel,
      streak_days: newStreakDays,
      last_action: new Date(),
    },
  });

  // TODO: Check and award badges based on progress
}

/**
 * Calculate level based on XP
 */
async function calculateLevel(xp: number): Promise<number> {
  const thresholds = await prisma.levelThreshold.findMany({
    orderBy: { level: 'desc' },
  });

  for (const threshold of thresholds) {
    if (xp >= threshold.xp_required) {
      return threshold.level;
    }
  }

  return 1; // Default to level 1
}

/**
 * Update streak counter
 */
async function updateStreak(
  user_id: string,
  lastAction: Date | null
): Promise<number> {
  if (!lastAction) return 1;

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const lastActionDate = new Date(lastAction);
  lastActionDate.setHours(0, 0, 0, 0);

  // If last action was yesterday, increment streak
  if (lastActionDate.getTime() === yesterday.getTime()) {
    const profile = await prisma.gamificationProfile.findUnique({
      where: { user_id },
    });
    return (profile?.streak_days || 0) + 1;
  }

  // If last action was today, maintain streak
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  if (lastActionDate.getTime() === today.getTime()) {
    const profile = await prisma.gamificationProfile.findUnique({
      where: { user_id },
    });
    return profile?.streak_days || 0;
  }

  // Otherwise, reset streak
  return 1;
}
