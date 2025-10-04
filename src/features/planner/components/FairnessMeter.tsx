'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/Card';

export interface MemberWorkload {
  user_id: string;
  name: string | null;
  email: string;
  total_minutes: number;
  task_count: number;
}

export interface FairnessMeterProps {
  workloads: MemberWorkload[];
  className?: string;
}

export function FairnessMeter({ workloads, className = '' }: FairnessMeterProps) {
  const maxMinutes = Math.max(...workloads.map((w) => w.total_minutes), 1);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Workload Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workloads.map((workload) => {
            const percentage = (workload.total_minutes / maxMinutes) * 100;
            const hours = Math.floor(workload.total_minutes / 60);
            const minutes = workload.total_minutes % 60;

            return (
              <div key={workload.user_id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {workload.name || workload.email}
                  </span>
                  <span className="text-xs text-gray-600">
                    {hours > 0 && `${hours}h `}
                    {minutes}m · {workload.task_count} tasks
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Fairness indicator */}
        <div className="mt-4 pt-4 border-t">
          {(() => {
            const avg =
              workloads.reduce((sum, w) => sum + w.total_minutes, 0) /
              workloads.length;
            const variance =
              workloads.reduce(
                (sum, w) => sum + Math.pow(w.total_minutes - avg, 2),
                0
              ) / workloads.length;
            const stdDev = Math.sqrt(variance);
            const fairnessScore = Math.max(
              0,
              100 - (stdDev / avg) * 100
            ).toFixed(0);

            return (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {fairnessScore}%
                </div>
                <div className="text-xs text-gray-600">Fairness Score</div>
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}
