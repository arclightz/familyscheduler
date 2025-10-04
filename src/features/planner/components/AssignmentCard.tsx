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
      className={`group relative rounded-md border p-3 transition-all hover:shadow-md ${
        assignment.status === 'done'
          ? 'border-green-300 bg-green-50'
          : assignment.status === 'skipped'
            ? 'border-yellow-300 bg-yellow-50'
            : 'border-gray-200 bg-white hover:border-blue-300'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {assignment.task.name}
          </h4>
          <p className="text-xs text-gray-600 mt-1">
            {startTime} - {endTime} ({assignment.task.duration_min}m)
          </p>
          <p className="text-xs text-gray-500 truncate mt-1">
            {assignment.user.name || assignment.user.email}
          </p>
        </div>
        <Badge variant={statusColors[assignment.status]} className="shrink-0">
          {assignment.status}
        </Badge>
      </div>

      {assignment.task.category && (
        <div className="mt-2">
          <Badge variant="info" className="text-xs">
            {assignment.task.category}
          </Badge>
        </div>
      )}

      {onStatusChange && assignment.status !== 'done' && (
        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="flex-1 rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange('done');
            }}
          >
            Complete
          </button>
          <button
            className="flex-1 rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-700"
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
