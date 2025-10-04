import { prisma } from '@/lib/prisma';
import type {
  CreateNotificationInput,
  CreateReminderScheduleInput,
  CreatePushSubscriptionInput,
  NotificationChannel,
} from './types';

export class NotificationRepository {
  /**
   * Create a new notification
   */
  async create(data: CreateNotificationInput) {
    return prisma.notification.create({
      data,
    });
  }

  /**
   * Get all notifications for a user
   */
  async findByUserId(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
      where: {
        user_id: userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { notification_id: notificationId },
      data: { read: true },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { user_id: userId, read: false },
      data: { read: true },
    });
  }

  /**
   * Delete old read notifications (cleanup)
   */
  async deleteOldRead(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return prisma.notification.deleteMany({
      where: {
        read: true,
        created_at: { lt: cutoffDate },
      },
    });
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { user_id: userId, read: false },
    });
  }
}

export class ReminderScheduleRepository {
  /**
   * Create a reminder schedule
   */
  async create(data: CreateReminderScheduleInput) {
    return prisma.reminderSchedule.create({
      data: {
        ...data,
        channels: data.channels as any,
      },
    });
  }

  /**
   * Get all reminder schedules for a user
   */
  async findByUserId(userId: string) {
    return prisma.reminderSchedule.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get enabled schedules for a specific frequency
   */
  async findEnabled(frequency: string) {
    return prisma.reminderSchedule.findMany({
      where: {
        enabled: true,
        frequency,
      },
    });
  }

  /**
   * Update a reminder schedule
   */
  async update(
    scheduleId: string,
    data: Partial<{
      enabled: boolean;
      time: string;
      offset_min: number;
      channels: NotificationChannel[];
    }>
  ) {
    return prisma.reminderSchedule.update({
      where: { schedule_id: scheduleId },
      data: {
        ...data,
        ...(data.channels && { channels: data.channels as any }),
      },
    });
  }

  /**
   * Delete a reminder schedule
   */
  async delete(scheduleId: string) {
    return prisma.reminderSchedule.delete({
      where: { schedule_id: scheduleId },
    });
  }
}

export class PushSubscriptionRepository {
  /**
   * Create or update a push subscription
   */
  async upsert(data: CreatePushSubscriptionInput) {
    return prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: {
        ...data,
        keys: data.keys as any,
      },
      update: {
        user_id: data.user_id,
        keys: data.keys as any,
        user_agent: data.user_agent,
      },
    });
  }

  /**
   * Get all push subscriptions for a user
   */
  async findByUserId(userId: string) {
    return prisma.pushSubscription.findMany({
      where: { user_id: userId },
    });
  }

  /**
   * Delete a push subscription
   */
  async delete(endpoint: string) {
    return prisma.pushSubscription.delete({
      where: { endpoint },
    });
  }

  /**
   * Delete all subscriptions for a user
   */
  async deleteByUserId(userId: string) {
    return prisma.pushSubscription.deleteMany({
      where: { user_id: userId },
    });
  }
}
