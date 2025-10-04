import * as cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { generateSchedule } from '@/features/plans/scheduler';
import { logger } from '@/lib/logger';

/**
 * Job scheduler for automated plan generation
 */
class JobScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private isRunning = false;

  /**
   * Start all scheduled jobs
   */
  start() {
    if (this.isRunning) {
      logger.info('Job scheduler is already running');
      return;
    }

    logger.info('Starting job scheduler...');

    // Weekly plan generation - runs every Sunday at 9 PM
    const weeklyPlanJob = cron.schedule(
      '0 21 * * 0',
      async () => {
        await this.generateWeeklyPlans();
      },
      {
        timezone: 'UTC',
      }
    );

    this.jobs.set('weekly-plan-generation', weeklyPlanJob);
    this.isRunning = true;

    logger.info('Job scheduler started successfully');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    if (!this.isRunning) {
      logger.info('Job scheduler is not running');
      return;
    }

    logger.info('Stopping job scheduler...');

    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });

    this.jobs.clear();
    this.isRunning = false;

    logger.info('Job scheduler stopped');
  }

  /**
   * Generate weekly plans for all active households
   */
  private async generateWeeklyPlans() {
    logger.info('Starting weekly plan generation job...');

    try {
      const households = await prisma.household.findMany({
        include: {
          tasks: {
            where: { active: true },
          },
          members: {
            include: {
              user: {
                include: {
                  calendars: true,
                },
              },
            },
          },
        },
      });

      logger.info(`Found ${households.length} households for plan generation`);

      for (const household of households) {
        try {
          await this.generatePlanForHousehold(household.household_id);
        } catch (error) {
          logger.error(
            `Failed to generate plan for household ${household.household_id}:`,
            error
          );
        }
      }

      logger.info('Weekly plan generation job completed');
    } catch (error) {
      logger.error('Weekly plan generation job failed:', error);
    }
  }

  /**
   * Generate a plan for a specific household
   */
  private async generatePlanForHousehold(householdId: string) {
    logger.info(`Generating plan for household: ${householdId}`);

    // Get next week's Monday
    const nextMonday = this.getNextMonday();

    // Check if a plan already exists for this week
    const existingPlan = await prisma.plan.findFirst({
      where: {
        household_id: householdId,
        week_start: nextMonday,
      },
    });

    if (existingPlan) {
      logger.info(
        `Plan already exists for household ${householdId} starting ${nextMonday.toISOString()}`
      );
      return;
    }

    // Get tasks and members
    const tasks = await prisma.task.findMany({
      where: {
        household_id: householdId,
        active: true,
      },
    });

    const members = await prisma.householdMember.findMany({
      where: { household_id: householdId },
      include: {
        user: {
          include: {
            calendars: true,
          },
        },
      },
    });

    if (tasks.length === 0) {
      logger.info(`No active tasks for household ${householdId}`);
      return;
    }

    if (members.length === 0) {
      logger.info(`No members for household ${householdId}`);
      return;
    }

    // Generate schedule
    const result = generateSchedule({
      week_start: nextMonday,
      tasks: tasks.map((t) => ({
        ...t,
        frequency: t.frequency as any,
        time_windows: t.time_windows as any,
        constraints: t.constraints as any,
        rotation_roster: t.rotation_roster as any,
      })),
      members: members.map((m) => ({
        id: m.id,
        household_id: m.household_id,
        user_id: m.user.user_id,
        role: m.role,
        capabilities: m.capabilities as any as string[],
        allergies: m.allergies as any as string[],
      })),
      calendar_events: new Map(),
      fairness_history: new Map(),
    });

    // Create plan
    const plan = await prisma.plan.create({
      data: {
        household_id: householdId,
        week_start: nextMonday,
        status: 'draft',
      },
    });

    // Create assignments
    await prisma.assignment.createMany({
      data: result.assignments.map((assignment) => ({
        plan_id: plan.plan_id,
        task_id: assignment.task_instance.task_id,
        user_id: assignment.user_id,
        member_id: assignment.member_id,
        start_at: assignment.start_at,
        end_at: assignment.end_at,
        status: 'pending',
      })),
    });

    logger.info(
      `Created plan ${plan.plan_id} with ${result.assignments.length} assignments for household ${householdId}`
    );
  }

  /**
   * Get the next Monday at 00:00:00
   */
  private getNextMonday(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday;
  }

  /**
   * Manually trigger weekly plan generation (for testing)
   */
  async triggerWeeklyPlans() {
    await this.generateWeeklyPlans();
  }
}

// Singleton instance
export const jobScheduler = new JobScheduler();
