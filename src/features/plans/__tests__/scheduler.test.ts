import { describe, it, expect } from 'vitest';
import {
  expandTasksForWeek,
  buildMemberAvailability,
  isAvailable,
  satisfiesConstraints,
  calculateAssignmentCost,
  generateSchedule,
  type TaskInstance,
  type MemberAvailability,
  type SchedulingContext,
} from '../scheduler';
import type {
  Task,
  HouseholdMember,
  CalendarEvent,
  Frequency,
  TaskConstraints,
} from '@/lib/schemas';

describe('Scheduler', () => {
  describe('expandTasksForWeek', () => {
    it('should expand daily tasks into 7 instances', () => {
      const weekStart = new Date('2025-10-06T00:00:00Z'); // Monday
      const tasks: Task[] = [
        {
          task_id: 'task-1',
          household_id: 'hh-1',
          name: 'Walk the dog',
          description: null,
          category: null,
          duration_min: 30,
          frequency: { type: 'daily' } as Frequency,
          time_windows: [{ start: '07:00', end: '08:00' }],
          constraints: null,
          fairness_weight: 1,
          rotation_roster: [],
          active: true,
        },
      ];

      const instances = expandTasksForWeek(tasks, weekStart);

      expect(instances).toHaveLength(7);
      expect(instances[0].name).toBe('Walk the dog');
    });

    it('should expand weekly tasks only on specified weekdays', () => {
      const weekStart = new Date('2025-10-06T00:00:00Z'); // Monday
      const tasks: Task[] = [
        {
          task_id: 'task-1',
          household_id: 'hh-1',
          name: 'Clean bathroom',
          description: null,
          category: null,
          duration_min: 45,
          frequency: { type: 'weekly', byWeekday: [6] } as Frequency, // Saturday only
          time_windows: [{ start: '10:00', end: '12:00' }],
          constraints: { adultsOnly: true },
          fairness_weight: 2,
          rotation_roster: [],
          active: true,
        },
      ];

      const instances = expandTasksForWeek(tasks, weekStart);

      expect(instances).toHaveLength(1);
      expect(instances[0].name).toBe('Clean bathroom');
    });

    it('should skip inactive tasks', () => {
      const weekStart = new Date('2025-10-06T00:00:00Z');
      const tasks: Task[] = [
        {
          task_id: 'task-1',
          household_id: 'hh-1',
          name: 'Inactive task',
          description: null,
          category: null,
          duration_min: 30,
          frequency: { type: 'daily' },
          time_windows: null,
          constraints: null,
          fairness_weight: 1,
          rotation_roster: [],
          active: false,
        },
      ];

      const instances = expandTasksForWeek(tasks, weekStart);

      expect(instances).toHaveLength(0);
    });
  });

  describe('buildMemberAvailability', () => {
    it('should build availability with busy periods from calendar', () => {
      const members: (HouseholdMember & { user_id: string })[] = [
        {
          id: 'member-1',
          household_id: 'hh-1',
          user_id: 'user-1',
          role: 'parent',
          capabilities: ['adult_only'],
          allergies: [],
        },
      ];

      const calendarEvents = new Map<string, CalendarEvent[]>([
        [
          'user-1',
          [
            {
              id: 'event-1',
              title: 'Work Meeting',
              start: new Date('2025-10-06T09:00:00Z'),
              end: new Date('2025-10-06T10:00:00Z'),
              allDay: false,
              busy: true,
            },
          ],
        ],
      ]);

      const fairnessHistory = new Map([['user-1', 100]]);

      const availability = buildMemberAvailability(
        members,
        calendarEvents,
        fairnessHistory
      );

      expect(availability).toHaveLength(1);
      expect(availability[0].member_id).toBe('member-1');
      expect(availability[0].busy_periods).toHaveLength(1);
      expect(availability[0].fairness_score).toBe(100);
    });
  });

  describe('isAvailable', () => {
    it('should return true when member has no conflicts', () => {
      const member: MemberAvailability = {
        member_id: 'member-1',
        user_id: 'user-1',
        capabilities: [],
        allergies: [],
        busy_periods: [],
        fairness_score: 0,
      };

      const start = new Date('2025-10-06T09:00:00Z');
      const end = new Date('2025-10-06T09:30:00Z');

      expect(isAvailable(member, start, end)).toBe(true);
    });

    it('should return false when task overlaps with busy period', () => {
      const member: MemberAvailability = {
        member_id: 'member-1',
        user_id: 'user-1',
        capabilities: [],
        allergies: [],
        busy_periods: [
          {
            start: new Date('2025-10-06T09:00:00Z'),
            end: new Date('2025-10-06T10:00:00Z'),
          },
        ],
        fairness_score: 0,
      };

      const start = new Date('2025-10-06T09:30:00Z');
      const end = new Date('2025-10-06T10:00:00Z');

      expect(isAvailable(member, start, end)).toBe(false);
    });

    it('should account for buffer time', () => {
      const member: MemberAvailability = {
        member_id: 'member-1',
        user_id: 'user-1',
        capabilities: [],
        allergies: [],
        busy_periods: [
          {
            start: new Date('2025-10-06T10:00:00Z'),
            end: new Date('2025-10-06T11:00:00Z'),
          },
        ],
        fairness_score: 0,
      };

      // Task ends at 10:00, but with 15-min buffer should conflict
      const start = new Date('2025-10-06T09:30:00Z');
      const end = new Date('2025-10-06T10:00:00Z');

      expect(isAvailable(member, start, end, 15)).toBe(false);
    });
  });

  describe('satisfiesConstraints', () => {
    it('should pass when no constraints specified', () => {
      const member: MemberAvailability = {
        member_id: 'member-1',
        user_id: 'user-1',
        capabilities: [],
        allergies: [],
        busy_periods: [],
        fairness_score: 0,
      };

      expect(satisfiesConstraints(member, null)).toBe(true);
    });

    it('should enforce adultsOnly constraint', () => {
      const adult: MemberAvailability = {
        member_id: 'member-1',
        user_id: 'user-1',
        capabilities: ['adult_only'],
        allergies: [],
        busy_periods: [],
        fairness_score: 0,
      };

      const teen: MemberAvailability = {
        member_id: 'member-2',
        user_id: 'user-2',
        capabilities: [],
        allergies: [],
        busy_periods: [],
        fairness_score: 0,
      };

      const constraints: TaskConstraints = { adultsOnly: true };

      expect(satisfiesConstraints(adult, constraints)).toBe(true);
      expect(satisfiesConstraints(teen, constraints)).toBe(false);
    });

    it('should enforce allergy exclusions', () => {
      const member: MemberAvailability = {
        member_id: 'member-1',
        user_id: 'user-1',
        capabilities: [],
        allergies: ['peanuts', 'dust'],
        busy_periods: [],
        fairness_score: 0,
      };

      const constraints: TaskConstraints = {
        excludeAllergies: ['dust'],
      };

      expect(satisfiesConstraints(member, constraints)).toBe(false);
    });

    it('should enforce required capabilities', () => {
      const member: MemberAvailability = {
        member_id: 'member-1',
        user_id: 'user-1',
        capabilities: ['can_drive'],
        allergies: [],
        busy_periods: [],
        fairness_score: 0,
      };

      const constraints: TaskConstraints = {
        requiredCapabilities: ['can_drive', 'has_license'],
      };

      expect(satisfiesConstraints(member, constraints)).toBe(false);

      const qualifiedMember: MemberAvailability = {
        ...member,
        capabilities: ['can_drive', 'has_license'],
      };

      expect(satisfiesConstraints(qualifiedMember, constraints)).toBe(true);
    });
  });

  describe('calculateAssignmentCost', () => {
    it('should return Infinity for constraint violations', () => {
      const taskInstance: TaskInstance = {
        task_id: 'task-1',
        name: 'Clean bathroom',
        duration_min: 45,
        fairness_weight: 2,
        preferred_windows: [],
        constraints: { adultsOnly: true },
        rotation_roster: [],
        priority: 100,
      };

      const teen: MemberAvailability = {
        member_id: 'member-1',
        user_id: 'user-1',
        capabilities: [],
        allergies: [],
        busy_periods: [],
        fairness_score: 0,
      };

      const cost = calculateAssignmentCost(
        taskInstance,
        teen,
        new Date('2025-10-06T10:00:00Z')
      );

      expect(cost).toBe(Infinity);
    });

    it('should prefer members with lower fairness scores', () => {
      const taskInstance: TaskInstance = {
        task_id: 'task-1',
        name: 'Walk the dog',
        duration_min: 30,
        fairness_weight: 1,
        preferred_windows: [
          {
            start: '2025-10-06T07:00:00.000Z',
            end: '2025-10-06T08:00:00.000Z',
          },
        ],
        constraints: null,
        rotation_roster: [],
        priority: 50,
      };

      const lowScore: MemberAvailability = {
        member_id: 'member-1',
        user_id: 'user-1',
        capabilities: [],
        allergies: [],
        busy_periods: [],
        fairness_score: 10,
      };

      const highScore: MemberAvailability = {
        member_id: 'member-2',
        user_id: 'user-2',
        capabilities: [],
        allergies: [],
        busy_periods: [],
        fairness_score: 100,
      };

      const time = new Date('2025-10-06T07:00:00Z');

      const costLow = calculateAssignmentCost(taskInstance, lowScore, time);
      const costHigh = calculateAssignmentCost(taskInstance, highScore, time);

      expect(costLow).toBeLessThan(costHigh);
    });
  });

  describe('generateSchedule', () => {
    it('should generate a complete schedule without conflicts', () => {
      const weekStart = new Date('2025-10-06T00:00:00Z'); // Monday

      const context: SchedulingContext = {
        week_start: weekStart,
        tasks: [
          {
            task_id: 'task-1',
            household_id: 'hh-1',
            name: 'Daily task',
            description: null,
            category: null,
            duration_min: 30,
            frequency: { type: 'daily' },
            time_windows: [{ start: '09:00', end: '10:00' }],
            constraints: null,
            fairness_weight: 1,
            rotation_roster: [],
            active: true,
          },
        ],
        members: [
          {
            id: 'member-1',
            household_id: 'hh-1',
            user_id: 'user-1',
            role: 'parent',
            capabilities: [],
            allergies: [],
          },
        ],
        calendar_events: new Map(),
        fairness_history: new Map([['user-1', 0]]),
      };

      const result = generateSchedule(context);

      expect(result.assignments).toHaveLength(7); // 7 days
      expect(result.unassigned).toHaveLength(0);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should mark tasks as unassigned when no member is available', () => {
      const weekStart = new Date('2025-10-06T00:00:00Z');

      const context: SchedulingContext = {
        week_start: weekStart,
        tasks: [
          {
            task_id: 'task-1',
            household_id: 'hh-1',
            name: 'Impossible task',
            description: null,
            category: null,
            duration_min: 60,
            frequency: { type: 'daily' },
            time_windows: [{ start: '09:00', end: '10:00' }],
            constraints: { adultsOnly: true },
            fairness_weight: 1,
            rotation_roster: [],
            active: true,
          },
        ],
        members: [
          {
            id: 'member-1',
            household_id: 'hh-1',
            user_id: 'user-1',
            role: 'teen',
            capabilities: [], // Not an adult
            allergies: [],
          },
        ],
        calendar_events: new Map(),
        fairness_history: new Map([['user-1', 0]]),
      };

      const result = generateSchedule(context);

      expect(result.assignments).toHaveLength(0);
      expect(result.unassigned).toHaveLength(7);
      expect(result.conflicts.length).toBeGreaterThan(0);
    });
  });
});
