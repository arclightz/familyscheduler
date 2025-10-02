import { z } from 'zod';

// Common schemas
export const IdSchema = z.string().min(1);

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

// User schemas
export const UserSchema = z.object({
  user_id: IdSchema,
  email: z.string().email(),
  name: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255).optional(),
});

// Household schemas
export const HouseholdSchema = z.object({
  household_id: IdSchema,
  name: z.string(),
  created_at: z.coerce.date(),
});

export const CreateHouseholdSchema = z.object({
  name: z.string().min(1).max(255),
});

export const HouseholdMemberSchema = z.object({
  id: IdSchema,
  household_id: IdSchema,
  user_id: IdSchema,
  role: z.string(),
  capabilities: z.array(z.string()),
  allergies: z.array(z.string()),
});

export const CreateHouseholdMemberSchema = z.object({
  user_id: IdSchema,
  role: z.enum(['parent', 'teen', 'child']),
  capabilities: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
});

export const InviteToHouseholdSchema = z.object({
  email: z.string().email(),
  role: z.enum(['parent', 'teen', 'child']),
});

// Task schemas
export const FrequencySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('daily'),
  }),
  z.object({
    type: z.literal('weekly'),
    byWeekday: z.array(z.number().int().min(0).max(6)), // 0=Sunday, 6=Saturday
  }),
  z.object({
    type: z.literal('monthly'),
    byMonthDay: z.number().int().min(1).max(31),
  }),
  z.object({
    type: z.literal('custom'),
    cron: z.string(),
  }),
]);

export const TimeWindowSchema = z.object({
  start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

export const TaskConstraintsSchema = z.object({
  adultsOnly: z.boolean().optional(),
  minimumAge: z.number().int().min(0).max(100).optional(),
  excludeAllergies: z.array(z.string()).optional(),
  requiredCapabilities: z.array(z.string()).optional(),
});

export const TaskSchema = z.object({
  task_id: IdSchema,
  household_id: IdSchema,
  name: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  duration_min: z.number().int().min(1),
  frequency: FrequencySchema,
  time_windows: z.array(TimeWindowSchema).nullable(),
  constraints: TaskConstraintsSchema.nullable(),
  fairness_weight: z.number().int().min(0).default(1),
  rotation_roster: z.array(IdSchema),
  active: z.boolean(),
});

export const CreateTaskSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  duration_min: z.number().int().min(1).max(480), // max 8 hours
  frequency: FrequencySchema,
  time_windows: z.array(TimeWindowSchema).optional(),
  constraints: TaskConstraintsSchema.optional(),
  fairness_weight: z.number().int().min(0).max(10).default(1),
  rotation_roster: z.array(IdSchema).default([]),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  active: z.boolean().optional(),
});

// Plan schemas
export const PlanSchema = z.object({
  plan_id: IdSchema,
  household_id: IdSchema,
  week_start: z.coerce.date(),
  status: z.enum(['draft', 'published']),
  created_at: z.coerce.date(),
});

export const CreatePlanSchema = z.object({
  week_start: z.coerce.date(),
});

export const AssignmentSchema = z.object({
  assignment_id: IdSchema,
  plan_id: IdSchema,
  task_id: IdSchema,
  user_id: IdSchema,
  member_id: IdSchema,
  start_at: z.coerce.date(),
  end_at: z.coerce.date(),
  status: z.enum(['pending', 'done', 'skipped']),
  notes: z.string().nullable(),
});

export const UpdateAssignmentSchema = z.object({
  start_at: z.coerce.date().optional(),
  end_at: z.coerce.date().optional(),
  status: z.enum(['pending', 'done', 'skipped']).optional(),
  notes: z.string().max(500).optional(),
});

// Calendar schemas
export const CalendarConnectionSchema = z.object({
  id: IdSchema,
  user_id: IdSchema,
  provider: z.enum(['google', 'microsoft']),
  account_id: z.string(),
});

export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  allDay: z.boolean(),
  busy: z.boolean(),
});

export const CalendarSyncSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

// Gamification schemas
export const BadgeSchema = z.object({
  badge_id: IdSchema,
  key: z.string(),
  name: z.string(),
  description: z.string(),
  tier: z.enum(['bronze', 'silver', 'gold', 'special']),
  icon: z.string().nullable(),
  rules: z.record(z.string(), z.unknown()),
});

export const EarnedBadgeSchema = z.object({
  id: IdSchema,
  profile_id: IdSchema,
  badge_id: IdSchema,
  tier: z.enum(['bronze', 'silver', 'gold', 'special']),
  earned_at: z.coerce.date(),
});

export const GamificationProfileSchema = z.object({
  id: IdSchema,
  user_id: IdSchema,
  xp: z.number().int().min(0),
  level: z.number().int().min(1),
  streak_days: z.number().int().min(0),
  last_action: z.coerce.date().nullable(),
});

export const RewardSchema = z.object({
  reward_id: IdSchema,
  household_id: IdSchema,
  name: z.string(),
  description: z.string().nullable(),
  min_level: z.number().int().min(1),
  cost_points: z.number().int().min(0),
  required_badges: z.array(z.string()),
  cooldown_days: z.number().int().min(0).nullable(),
  active: z.boolean(),
});

export const CreateRewardSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  min_level: z.number().int().min(1).max(100).default(1),
  cost_points: z.number().int().min(0).max(10000).default(0),
  required_badges: z.array(z.string()).default([]),
  cooldown_days: z.number().int().min(0).optional(),
});

export const RedeemRewardSchema = z.object({
  reward_id: IdSchema,
});

// API Response wrappers
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    success: z.literal(true),
  });

export const ApiErrorResponseSchema = z.object({
  error: ErrorSchema,
  success: z.literal(false),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      totalPages: z.number().int(),
    }),
    success: z.literal(true),
  });

// Type exports
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type Household = z.infer<typeof HouseholdSchema>;
export type CreateHousehold = z.infer<typeof CreateHouseholdSchema>;
export type HouseholdMember = z.infer<typeof HouseholdMemberSchema>;
export type CreateHouseholdMember = z.infer<typeof CreateHouseholdMemberSchema>;
export type InviteToHousehold = z.infer<typeof InviteToHouseholdSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type Frequency = z.infer<typeof FrequencySchema>;
export type TimeWindow = z.infer<typeof TimeWindowSchema>;
export type TaskConstraints = z.infer<typeof TaskConstraintsSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type CreatePlan = z.infer<typeof CreatePlanSchema>;
export type Assignment = z.infer<typeof AssignmentSchema>;
export type UpdateAssignment = z.infer<typeof UpdateAssignmentSchema>;
export type CalendarConnection = z.infer<typeof CalendarConnectionSchema>;
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
export type CalendarSync = z.infer<typeof CalendarSyncSchema>;
export type Badge = z.infer<typeof BadgeSchema>;
export type EarnedBadge = z.infer<typeof EarnedBadgeSchema>;
export type GamificationProfile = z.infer<typeof GamificationProfileSchema>;
export type Reward = z.infer<typeof RewardSchema>;
export type CreateReward = z.infer<typeof CreateRewardSchema>;
export type RedeemReward = z.infer<typeof RedeemRewardSchema>;
export type ApiError = z.infer<typeof ErrorSchema>;