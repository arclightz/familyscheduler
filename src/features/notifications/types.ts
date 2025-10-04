export type NotificationType = 'reminder' | 'achievement' | 'system' | 'plan_published';

export type ReminderFrequency = 'daily' | 'before_task' | 'weekly_summary';

export type NotificationChannel = 'push' | 'email';

export interface Notification {
  notification_id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  reference_id?: string;
  reference_type?: string;
  read: boolean;
  created_at: Date;
}

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  reference_id?: string;
  reference_type?: string;
}

export interface ReminderSchedule {
  schedule_id: string;
  user_id: string;
  task_id?: string;
  enabled: boolean;
  frequency: ReminderFrequency;
  time?: string;
  offset_min?: number;
  channels: NotificationChannel[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateReminderScheduleInput {
  user_id: string;
  task_id?: string;
  frequency: ReminderFrequency;
  time?: string;
  offset_min?: number;
  channels: NotificationChannel[];
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_agent?: string;
  created_at: Date;
}

export interface CreatePushSubscriptionInput {
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_agent?: string;
}
