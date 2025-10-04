import * as cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/features/notifications/service';
import { logger } from '@/lib/logger';

const notificationService = new NotificationService();

export class ReminderJobScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  start() {
    // Daily summary reminders (8 AM)
    const dailyRemindersJob = cron.schedule(
      '0 8 * * *',
      async () => {
        await this.sendDailyReminders();
      },
      { timezone: 'UTC' }
    );
    this.jobs.set('daily-reminders', dailyRemindersJob);

    // Before-task reminders (check every 15 minutes)
    const beforeTaskRemindersJob = cron.schedule(
      '*/15 * * * *',
      async () => {
        await this.sendBeforeTaskReminders();
      },
      { timezone: 'UTC' }
    );
    this.jobs.set('before-task-reminders', beforeTaskRemindersJob);

    // Weekly summary (Sunday 6 PM)
    const weeklyRemindersJob = cron.schedule(
      '0 18 * * 0',
      async () => {
        await this.sendWeeklySummaries();
      },
      { timezone: 'UTC' }
    );
    this.jobs.set('weekly-reminders', weeklyRemindersJob);

    // Cleanup old notifications (daily at 2 AM)
    const cleanupJob = cron.schedule(
      '0 2 * * *',
      async () => {
        await notificationService.cleanupOldNotifications(30);
        logger.info('Cleaned up old notifications');
      },
      { timezone: 'UTC' }
    );
    this.jobs.set('cleanup-notifications', cleanupJob);

    logger.info('Reminder job scheduler started');
  }

  stop() {
    this.jobs.forEach((job) => job.stop());
    this.jobs.clear();
    logger.info('Reminder job scheduler stopped');
  }

  /**
   * Send daily summary of upcoming tasks
   */
  private async sendDailyReminders() {
    try {
      const schedules = await prisma.reminderSchedule.findMany({
        where: { enabled: true, frequency: 'daily' },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      for (const schedule of schedules) {
        const assignments = await prisma.assignment.findMany({
          where: {
            user_id: schedule.user_id,
            start_at: { gte: today, lt: tomorrow },
            status: 'pending',
          },
          include: { task: true },
        });

        if (assignments.length > 0) {
          const taskList = assignments
            .map((a) => `- ${a.task.name} at ${new Date(a.start_at).toLocaleTimeString()}`)
            .join('\n');

          await notificationService.sendNotification({
            user_id: schedule.user_id,
            type: 'reminder',
            title: 'Your Tasks for Today',
            message: `You have ${assignments.length} task(s) scheduled:\n${taskList}`,
            action_url: '/planner',
          });
        }
      }

      logger.info({ count: schedules.length }, 'Daily reminders sent');
    } catch (error) {
      logger.error({ error }, 'Error sending daily reminders');
    }
  }

  /**
   * Send reminders before tasks start
   */
  private async sendBeforeTaskReminders() {
    try {
      const schedules = await prisma.reminderSchedule.findMany({
        where: { enabled: true, frequency: 'before_task' },
      });

      const now = new Date();

      for (const schedule of schedules) {
        const offsetMin = schedule.offset_min || 15;
        const reminderTime = new Date(now.getTime() + offsetMin * 60000);

        const assignments = await prisma.assignment.findMany({
          where: {
            user_id: schedule.user_id,
            start_at: {
              gte: now,
              lte: reminderTime,
            },
            status: 'pending',
            ...(schedule.task_id && { task_id: schedule.task_id }),
          },
          include: { task: true },
        });

        for (const assignment of assignments) {
          await notificationService.sendTaskReminder(
            schedule.user_id,
            assignment.task.name,
            assignment.assignment_id,
            assignment.start_at
          );
        }
      }

      logger.info('Before-task reminders checked');
    } catch (error) {
      logger.error({ error }, 'Error sending before-task reminders');
    }
  }

  /**
   * Send weekly summary of completed tasks and upcoming week
   */
  private async sendWeeklySummaries() {
    try {
      const schedules = await prisma.reminderSchedule.findMany({
        where: { enabled: true, frequency: 'weekly_summary' },
      });

      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Last Sunday
      weekStart.setHours(0, 0, 0, 0);

      const nextWeekStart = new Date(weekStart);
      nextWeekStart.setDate(weekStart.getDate() + 7);

      for (const schedule of schedules) {
        // Count completed tasks this week
        const completedCount = await prisma.assignment.count({
          where: {
            user_id: schedule.user_id,
            start_at: { gte: weekStart, lt: now },
            status: 'done',
          },
        });

        // Get upcoming tasks for next week
        const upcomingTasks = await prisma.assignment.count({
          where: {
            user_id: schedule.user_id,
            start_at: { gte: nextWeekStart, lt: new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000) },
            status: 'pending',
          },
        });

        await notificationService.sendNotification({
          user_id: schedule.user_id,
          type: 'system',
          title: 'Weekly Summary',
          message: `This week: ${completedCount} tasks completed. Next week: ${upcomingTasks} tasks scheduled.`,
          action_url: '/planner',
        });
      }

      logger.info({ count: schedules.length }, 'Weekly summaries sent');
    } catch (error) {
      logger.error({ error }, 'Error sending weekly summaries');
    }
  }
}
