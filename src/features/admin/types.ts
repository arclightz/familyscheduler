export interface SystemMetrics {
  total_users: number;
  total_households: number;
  total_tasks: number;
  total_plans: number;
  active_plans: number;
  completed_assignments_today: number;
  completed_assignments_week: number;
}

export interface AuditLog {
  audit_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface CreateAuditLogInput {
  user_id: string;
  action: 'create' | 'update' | 'delete' | 'publish';
  entity_type: 'plan' | 'task' | 'household' | 'assignment';
  entity_id: string;
  changes: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface HouseholdStats {
  household_id: string;
  household_name: string;
  member_count: number;
  task_count: number;
  active_plan_count: number;
  completion_rate: number;
  avg_xp_per_member: number;
}
