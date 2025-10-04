'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';

export interface Assignment {
  assignment_id: string;
  task: {
    name: string;
    description: string | null;
    category: string | null;
    duration_min: number;
  };
  user: {
    name: string | null;
    email: string;
  };
  start_at: Date;
  end_at: Date;
  status: 'pending' | 'done' | 'skipped';
  notes: string | null;
}

export interface AssignmentCardProps {
  assignment: Assignment;
  onClick?: () => void;
  onStatusChange?: (status: 'pending' | 'done' | 'skipped') => void;
}

export function AssignmentCard({
  assignment,
  onClick,
  onStatusChange,
}: AssignmentCardProps) {
  const statusColors = {
    pending: 'default',
    done: 'success',
    skipped: 'warning',
  } as const;

  const startTime = new Date(assignment.start_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const endTime = new Date(assignment.end_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group relative rounded-xl border-2 p-3 transition-all duration-200 ${
        assignment.status === 'done'
          ? 'border-accent-green-300 bg-gradient-to-br from-accent-green-50 to-white shadow-soft'
          : assignment.status === 'skipped'
            ? 'border-accent-orange-300 bg-gradient-to-br from-accent-orange-50 to-white shadow-soft'
            : 'border-secondary-200 bg-white hover:border-primary-400 hover:shadow-medium hover:-translate-y-0.5'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-secondary-900 truncate">
            {assignment.task.name}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-secondary-600 font-semibold">
              {startTime} - {endTime}
            </span>
            <span className="w-1 h-1 bg-secondary-400 rounded-full"></span>
            <span className="text-xs text-secondary-500 font-medium">
              {assignment.task.duration_min}min
            </span>
          </div>
        </div>
        <Badge variant={statusColors[assignment.status]} size="sm" dot className="shrink-0">
          {assignment.status}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-accent-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          {assignment.user.name?.[0] ?? assignment.user.email[0]}
        </div>
        <p className="text-xs text-secondary-600 font-medium truncate flex-1">
          {assignment.user.name || assignment.user.email}
        </p>
      </div>

      {assignment.task.category && (
        <div className="mt-2">
          <Badge variant="info" size="sm">
            {assignment.task.category}
          </Badge>
        </div>
      )}

      {onStatusChange && assignment.status !== 'done' && (
        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            className="flex-1 rounded-lg bg-gradient-to-r from-accent-green-600 to-accent-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:from-accent-green-700 hover:to-accent-green-800 shadow-soft hover:shadow-medium transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange('done');
            }}
          >
            ✓ Complete
          </button>
          <button
            className="flex-1 rounded-lg bg-gradient-to-r from-secondary-600 to-secondary-700 px-3 py-1.5 text-xs font-semibold text-white hover:from-secondary-700 hover:to-secondary-800 shadow-soft hover:shadow-medium transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange('skipped');
            }}
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
