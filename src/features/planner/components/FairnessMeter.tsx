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

  const colors = [
    'from-primary-500 to-primary-600',
    'from-accent-purple-500 to-accent-purple-600',
    'from-accent-green-500 to-accent-green-600',
    'from-accent-orange-500 to-accent-orange-600',
    'from-secondary-500 to-secondary-600',
  ];

  return (
    <Card className={`${className} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-2 h-2 bg-accent-green-500 rounded-full"></span>
          Workload Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {workloads.map((workload, index) => {
            const percentage = (workload.total_minutes / maxMinutes) * 100;
            const hours = Math.floor(workload.total_minutes / 60);
            const minutes = workload.total_minutes % 60;

            return (
              <div key={workload.user_id} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 bg-gradient-to-br ${colors[index % colors.length]} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-soft`}>
                      {workload.name?.[0] ?? workload.email[0]}
                    </div>
                    <span className="text-sm font-bold text-secondary-900">
                      {workload.name || workload.email}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-secondary-600 bg-secondary-100 px-2 py-1 rounded-lg">
                    {hours > 0 && `${hours}h `}
                    {minutes}m · {workload.task_count} tasks
                  </span>
                </div>
                <div className="h-3 bg-secondary-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-500 shadow-soft`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Fairness indicator */}
        <div className="mt-6 pt-6 border-t-2 border-secondary-200">
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

            const scoreColor =
              Number(fairnessScore) >= 80
                ? 'from-accent-green-500 to-accent-green-600'
                : Number(fairnessScore) >= 60
                ? 'from-accent-orange-500 to-accent-orange-600'
                : 'from-red-500 to-red-600';

            return (
              <div className="text-center">
                <div className={`inline-block text-5xl font-extrabold bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent drop-shadow-lg`}>
                  {fairnessScore}%
                </div>
                <div className="text-sm font-semibold text-secondary-600 mt-1">Fairness Score</div>
                <p className="text-xs text-secondary-500 mt-2">
                  {Number(fairnessScore) >= 80 ? '✓ Excellent balance' : Number(fairnessScore) >= 60 ? 'Good balance' : 'Consider rebalancing'}
                </p>
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}
