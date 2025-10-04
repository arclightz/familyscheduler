/**
 * Scheduling Engine - Core algorithm for fair task assignment
 *
 * Pure functions for generating weekly task assignments that:
 * - Balance workload across family members
 * - Respect constraints (adultsOnly, allergies, etc.)
 * - Avoid time conflicts
 * - Honor rotation rosters
 */

import type {
  Task,
  Assignment,
  HouseholdMember,
  CalendarEvent,
  Frequency,
  TimeWindow,
  TaskConstraints,
} from '@/lib/schemas';

// ============================================================================
// Types
// ============================================================================

export interface TaskInstance {
  task_id: string;
  name: string;
  duration_min: number;
  fairness_weight: number;
  preferred_windows: TimeWindow[];
  constraints: TaskConstraints | null;
  rotation_roster: string[];
  priority: number;
}

export interface MemberAvailability {
  member_id: string;
  user_id: string;
  capabilities: string[];
  allergies: string[];
  busy_periods: { start: Date; end: Date }[];
  fairness_score: number; // rolling sum from past weeks
}

export interface SchedulingContext {
  week_start: Date;
  tasks: Task[];
  members: (HouseholdMember & { user_id: string })[];
  calendar_events: Map<string, CalendarEvent[]>; // user_id -> events
  fairness_history: Map<string, number>; // user_id -> score
}

export interface AssignmentCandidate {
  task_instance: TaskInstance;
  member_id: string;
  user_id: string;
  start_at: Date;
  end_at: Date;
  cost: number;
}

export interface SchedulingResult {
  assignments: AssignmentCandidate[];
  unassigned: TaskInstance[];
  conflicts: string[];
}

// ============================================================================
// Task Expansion
// ============================================================================

/**
 * Expand recurring tasks into concrete instances for a given week
 */
export function expandTasksForWeek(
  tasks: Task[],
  weekStart: Date
): TaskInstance[] {
  const instances: TaskInstance[] = [];
  const weekEnd = addDays(weekStart, 7);

  for (const task of tasks) {
    if (!task.active) continue;

    const occurrences = getTaskOccurrences(
      task.frequency as Frequency,
      weekStart,
      weekEnd
    );

    for (const date of occurrences) {
      const windows = task.time_windows
        ? (task.time_windows as TimeWindow[])
        : [{ start: '00:00', end: '23:59' }];

      instances.push({
        task_id: task.task_id,
        name: task.name,
        duration_min: task.duration_min,
        fairness_weight: task.fairness_weight,
        preferred_windows: windows.map((w) => ({
          start: `${date.toISOString().split('T')[0]}T${w.start}`,
          end: `${date.toISOString().split('T')[0]}T${w.end}`,
        })),
        constraints: task.constraints as TaskConstraints | null,
        rotation_roster: task.rotation_roster as string[],
        priority: calculateTaskPriority(task),
      });
    }
  }

  return instances.sort((a, b) => b.priority - a.priority);
}

/**
 * Get occurrence dates for a task based on frequency
 */
function getTaskOccurrences(
  frequency: Frequency,
  weekStart: Date,
  weekEnd: Date
): Date[] {
  const dates: Date[] = [];

  if (frequency.type === 'daily') {
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(weekStart, i));
    }
  } else if (frequency.type === 'weekly') {
    const byWeekday = frequency.byWeekday || [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday
      if (byWeekday.includes(dayOfWeek)) {
        dates.push(date);
      }
    }
  } else if (frequency.type === 'monthly') {
    const byMonthDay = frequency.byMonthDay;
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      if (date.getDate() === byMonthDay) {
        dates.push(date);
      }
    }
  }

  return dates.filter((d) => d >= weekStart && d < weekEnd);
}

/**
 * Calculate priority for task sorting
 */
function calculateTaskPriority(task: Task): number {
  let priority = 0;

  // Hard-time tasks (narrow windows) get higher priority
  const windows = (task.time_windows as TimeWindow[]) || [];
  if (windows.length > 0) {
    const avgWindowSize =
      windows.reduce((sum, w) => {
        const [startH, startM] = w.start.split(':').map(Number);
        const [endH, endM] = w.end.split(':').map(Number);
        return sum + (endH * 60 + endM - (startH * 60 + startM));
      }, 0) / windows.length;

    priority += Math.max(0, 100 - avgWindowSize);
  }

  // Higher fairness weight = higher priority
  priority += task.fairness_weight * 20;

  // Longer duration = higher priority
  priority += task.duration_min / 10;

  return priority;
}

// ============================================================================
// Availability Calculation
// ============================================================================

/**
 * Build availability info for all members
 */
export function buildMemberAvailability(
  members: (HouseholdMember & { user_id: string })[],
  calendarEvents: Map<string, CalendarEvent[]>,
  fairnessHistory: Map<string, number>
): MemberAvailability[] {
  return members.map((member) => {
    const events = calendarEvents.get(member.user_id) || [];
    const busyPeriods = events
      .filter((e) => e.busy || e.allDay)
      .map((e) => ({
        start: new Date(e.start),
        end: new Date(e.end),
      }));

    return {
      member_id: member.id,
      user_id: member.user_id,
      capabilities: Array.isArray(member.capabilities)
        ? member.capabilities
        : [],
      allergies: Array.isArray(member.allergies) ? member.allergies : [],
      busy_periods: busyPeriods,
      fairness_score: fairnessHistory.get(member.user_id) || 0,
    };
  });
}

/**
 * Check if a member is available during a time slot
 */
export function isAvailable(
  member: MemberAvailability,
  start: Date,
  end: Date,
  bufferMinutes = 15
): boolean {
  for (const busy of member.busy_periods) {
    const busyStart = addMinutes(busy.start, -bufferMinutes);
    const busyEnd = addMinutes(busy.end, bufferMinutes);

    if (start < busyEnd && end > busyStart) {
      return false; // overlaps with busy period
    }
  }
  return true;
}

// ============================================================================
// Constraint Validation
// ============================================================================

/**
 * Check if a member satisfies task constraints
 */
export function satisfiesConstraints(
  member: MemberAvailability,
  constraints: TaskConstraints | null
): boolean {
  if (!constraints) return true;

  // Adults-only check
  if (constraints.adultsOnly) {
    if (!member.capabilities.includes('adult_only')) {
      return false;
    }
  }

  // Required capabilities
  if (constraints.requiredCapabilities) {
    for (const required of constraints.requiredCapabilities) {
      if (!member.capabilities.includes(required)) {
        return false;
      }
    }
  }

  // Allergy exclusions
  if (constraints.excludeAllergies) {
    for (const allergy of constraints.excludeAllergies) {
      if (member.allergies.includes(allergy)) {
        return false;
      }
    }
  }

  return true;
}

// ============================================================================
// Assignment Cost Calculation
// ============================================================================

/**
 * Calculate cost for assigning a task to a member at a specific time
 * Lower cost = better assignment
 */
export function calculateAssignmentCost(
  taskInstance: TaskInstance,
  member: MemberAvailability,
  startTime: Date
): number {
  // Constraint violations get infinite cost
  if (!satisfiesConstraints(member, taskInstance.constraints)) {
    return Infinity;
  }

  const endTime = addMinutes(startTime, taskInstance.duration_min);

  // Availability check
  if (!isAvailable(member, startTime, endTime)) {
    return Infinity;
  }

  let cost = 0;

  // Fairness component: prefer members with lower current load
  const fairnessWeight = 10;
  cost += member.fairness_score * fairnessWeight;

  // Time window preference: prefer times within preferred windows
  let withinPreferredWindow = false;
  for (const window of taskInstance.preferred_windows) {
    const windowStart = new Date(window.start);
    const windowEnd = new Date(window.end);
    if (startTime >= windowStart && endTime <= windowEnd) {
      withinPreferredWindow = true;
      break;
    }
  }
  if (!withinPreferredWindow) {
    cost += 50; // penalty for non-preferred times
  }

  return cost;
}

// ============================================================================
// Main Scheduling Algorithm
// ============================================================================

/**
 * Generate optimal weekly schedule
 */
export function generateSchedule(context: SchedulingContext): SchedulingResult {
  const instances = expandTasksForWeek(context.tasks, context.week_start);
  const availability = buildMemberAvailability(
    context.members,
    context.calendar_events,
    context.fairness_history
  );

  const assignments: AssignmentCandidate[] = [];
  const unassigned: TaskInstance[] = [];
  const conflicts: string[] = [];

  // Track current fairness scores (will be updated as we assign)
  const currentScores = new Map(
    availability.map((m) => [m.user_id, m.fairness_score])
  );

  // Track occupied time slots per member
  const occupiedSlots = new Map<string, { start: Date; end: Date }[]>(
    availability.map((m) => [m.user_id, [...m.busy_periods]])
  );

  for (const instance of instances) {
    const candidate = findBestAssignment(
      instance,
      availability,
      currentScores,
      occupiedSlots
    );

    if (candidate) {
      assignments.push(candidate);

      // Update scores and occupied slots
      const scoreIncrease =
        instance.duration_min * instance.fairness_weight;
      currentScores.set(
        candidate.user_id,
        (currentScores.get(candidate.user_id) || 0) + scoreIncrease
      );

      const slots = occupiedSlots.get(candidate.user_id) || [];
      slots.push({ start: candidate.start_at, end: candidate.end_at });
      occupiedSlots.set(candidate.user_id, slots);
    } else {
      unassigned.push(instance);
      conflicts.push(
        `No available slot found for task "${instance.name}"`
      );
    }
  }

  return { assignments, unassigned, conflicts };
}

/**
 * Find best member and time slot for a task instance
 */
function findBestAssignment(
  instance: TaskInstance,
  availability: MemberAvailability[],
  currentScores: Map<string, number>,
  occupiedSlots: Map<string, { start: Date; end: Date }[]>
): AssignmentCandidate | null {
  let bestCandidate: AssignmentCandidate | null = null;
  let lowestCost = Infinity;

  // Handle rotation roster if specified
  const eligibleMembers = instance.rotation_roster.length
    ? availability.filter((m) => instance.rotation_roster.includes(m.member_id))
    : availability;

  for (const member of eligibleMembers) {
    // Update member's current fairness score
    const updatedMember = {
      ...member,
      fairness_score: currentScores.get(member.user_id) || 0,
      busy_periods: occupiedSlots.get(member.user_id) || member.busy_periods,
    };

    for (const window of instance.preferred_windows) {
      const windowStart = new Date(window.start);
      const windowEnd = new Date(window.end);

      // Try different start times within the window (15-min increments)
      for (
        let time = windowStart;
        time < windowEnd;
        time = addMinutes(time, 15)
      ) {
        const endTime = addMinutes(time, instance.duration_min);
        if (endTime > windowEnd) break;

        const cost = calculateAssignmentCost(instance, updatedMember, time);

        if (cost < lowestCost) {
          lowestCost = cost;
          bestCandidate = {
            task_instance: instance,
            member_id: member.member_id,
            user_id: member.user_id,
            start_at: time,
            end_at: endTime,
            cost,
          };
        }
      }
    }
  }

  return lowestCost === Infinity ? null : bestCandidate;
}

// ============================================================================
// Utility Functions
// ============================================================================

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}
