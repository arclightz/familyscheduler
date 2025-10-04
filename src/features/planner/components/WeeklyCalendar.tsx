'use client';

import React from 'react';
import { AssignmentCard, type Assignment } from './AssignmentCard';

export interface WeeklyCalendarProps {
  weekStart: Date;
  assignments: Assignment[];
  onAssignmentClick?: (assignment: Assignment) => void;
  onStatusChange?: (assignmentId: string, status: 'pending' | 'done' | 'skipped') => void;
}

export function WeeklyCalendar({
  weekStart,
  assignments,
  onAssignmentClick,
  onStatusChange,
}: WeeklyCalendarProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Group assignments by day
  const assignmentsByDay = React.useMemo(() => {
    const groups: Assignment[][] = Array.from({ length: 7 }, () => []);

    assignments.forEach((assignment) => {
      const assignmentDate = new Date(assignment.start_at);
      const dayIndex = (assignmentDate.getDay() + 6) % 7; // Convert to Mon=0
      groups[dayIndex].push(assignment);
    });

    // Sort assignments within each day by start time
    groups.forEach((dayAssignments) => {
      dayAssignments.sort(
        (a, b) =>
          new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
      );
    });

    return groups;
  }, [assignments]);

  const formatDate = (dayOffset: number) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayOffset);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-4 min-w-[900px]">
        {days.map((day, index) => (
          <div key={day} className="flex flex-col">
            {/* Day header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-white to-secondary-50 border-b-2 border-secondary-200 pb-3 mb-3 rounded-t-lg">
              <div className="font-bold text-base text-secondary-900">{day}</div>
              <div className="text-xs text-secondary-600 font-semibold">{formatDate(index)}</div>
            </div>

            {/* Assignments for this day */}
            <div className="space-y-3 flex-1 min-h-[200px] bg-secondary-50/30 rounded-lg p-2">
              {assignmentsByDay[index].length > 0 ? (
                assignmentsByDay[index].map((assignment) => (
                  <AssignmentCard
                    key={assignment.assignment_id}
                    assignment={assignment}
                    onClick={() => onAssignmentClick?.(assignment)}
                    onStatusChange={(status) =>
                      onStatusChange?.(assignment.assignment_id, status)
                    }
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="text-3xl mb-2 opacity-40">📭</div>
                  <div className="text-xs text-secondary-400 font-medium">
                    No tasks
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
