import {
  NotificationRepository,
  ReminderScheduleRepository,
  PushSubscriptionRepository,
} from './repository';
import type {
  CreateNotificationInput,
  CreateReminderScheduleInput,
  CreatePushSubscriptionInput,
  NotificationType,
  NotificationChannel,
} from './types';
import { logger } from '@/lib/logger';

export class NotificationService {
  private notificationRepo = new NotificationRepository();
  private reminderRepo = new ReminderScheduleRepository();
  private pushRepo = new PushSubscriptionRepository();

  /**
   * Send a notification to a user
   */
  async sendNotification(input: CreateNotificationInput) {
    const notification = await this.notificationRepo.create(input);

    // Get user's push subscriptions and reminder settings
    const subscriptions = await this.pushRepo.findByUserId(input.user_id);
    const schedules = await this.reminderRepo.findByUserId(input.user_id);

    // Determine which channels to use based on notification type
    const channels = this.getChannelsForNotificationType(input.type, schedules);

    // Send push notifications if enabled
    if (channels.includes('push') && subscriptions.length > 0) {
      await this.sendPushNotifications(subscriptions, {
        title: input.title,
        body: input.message,
        data: {
          url: input.action_url,
          notification_id: notification.notification_id,
        },
      });
    }

    // TODO: Send email if enabled
    if (channels.includes('email')) {
      logger.info({ userId: input.user_id, type: input.type }, 'Email notification queued');
    }

    return notification;
  }

  /**
   * Send a task reminder notification
   */
  async sendTaskReminder(
    userId: string,
    taskName: string,
    assignmentId: string,
    startTime: Date
  ) {
    return this.sendNotification({
      user_id: userId,
      type: 'reminder',
      title: 'Task Reminder',
      message: `${taskName} is scheduled to start at ${startTime.toLocaleTimeString()}`,
      action_url: `/tasks/${assignmentId}`,
      reference_id: assignmentId,
      reference_type: 'assignment',
    });
  }

  /**
   * Send achievement notification (badge earned, level up)
   */
  async sendAchievementNotification(
    userId: string,
    title: string,
    message: string,
    badgeId?: string
  ) {
    return this.sendNotification({
      user_id: userId,
      type: 'achievement',
      title,
      message,
      action_url: '/profile',
      reference_id: badgeId,
      reference_type: badgeId ? 'badge' : undefined,
    });
  }

  /**
   * Send plan published notification
   */
  async sendPlanPublishedNotification(
    userId: string,
    weekStart: Date,
    planId: string
  ) {
    const weekStartStr = weekStart.toLocaleDateString();
    return this.sendNotification({
      user_id: userId,
      type: 'plan_published',
      title: 'New Weekly Plan Available',
      message: `Your task plan for the week of ${weekStartStr} is now available`,
      action_url: `/planner?plan=${planId}`,
      reference_id: planId,
      reference_type: 'plan',
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, unreadOnly = false) {
    return this.notificationRepo.findByUserId(userId, unreadOnly);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    return this.notificationRepo.markAsRead(notificationId);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    return this.notificationRepo.markAllAsRead(userId);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string) {
    return this.notificationRepo.getUnreadCount(userId);
  }

  /**
   * Create or update reminder schedule
   */
  async createReminderSchedule(input: CreateReminderScheduleInput) {
    return this.reminderRepo.create(input);
  }

  /**
   * Get user's reminder schedules
   */
  async getReminderSchedules(userId: string) {
    return this.reminderRepo.findByUserId(userId);
  }

  /**
   * Update reminder schedule
   */
  async updateReminderSchedule(
    scheduleId: string,
    data: Partial<{
      enabled: boolean;
      time: string;
      offset_min: number;
      channels: NotificationChannel[];
    }>
  ) {
    return this.reminderRepo.update(scheduleId, data);
  }

  /**
   * Delete reminder schedule
   */
  async deleteReminderSchedule(scheduleId: string) {
    return this.reminderRepo.delete(scheduleId);
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(input: CreatePushSubscriptionInput) {
    return this.pushRepo.upsert(input);
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(endpoint: string) {
    return this.pushRepo.delete(endpoint);
  }

  /**
   * Cleanup old read notifications
   */
  async cleanupOldNotifications(daysOld = 30) {
    return this.notificationRepo.deleteOldRead(daysOld);
  }

  /**
   * Determine which channels to use based on notification type and user settings
   */
  private getChannelsForNotificationType(
    type: NotificationType,
    schedules: any[]
  ): NotificationChannel[] {
    const channels: NotificationChannel[] = [];

    // Find relevant schedules
    const relevantSchedules = schedules.filter((s) => s.enabled);

    if (relevantSchedules.length > 0) {
      // Aggregate all enabled channels from schedules
      const channelSet = new Set<NotificationChannel>();
      relevantSchedules.forEach((schedule) => {
        const scheduleChannels = schedule.channels as NotificationChannel[];
        scheduleChannels.forEach((ch) => channelSet.add(ch));
      });
      channels.push(...Array.from(channelSet));
    } else {
      // Default: push notifications only
      channels.push('push');
    }

    return channels;
  }

  /**
   * Send push notifications using Web Push API
   */
  private async sendPushNotifications(
    subscriptions: any[],
    payload: { title: string; body: string; data?: any }
  ) {
    // TODO: Implement Web Push using web-push library
    // For now, just log
    logger.info(
      {
        count: subscriptions.length,
        title: payload.title,
      },
      'Push notifications queued'
    );
  }
}
