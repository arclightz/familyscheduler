import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';

interface MiniStatsProps {
  xp: number;
  level: number;
  streakDays: number;
}

/**
 * Compact gamification stats widget for dashboard/planner
 */
export function MiniStats({ xp, level, streakDays }: MiniStatsProps) {
  return (
    <Link href="/profile">
      <Card className="hover:border-blue-400 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⭐</div>
              <div>
                <div className="text-sm font-medium text-gray-600">Level {level}</div>
                <div className="text-xs text-gray-500">{xp} XP</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔥</div>
              <div>
                <div className="text-sm font-medium text-gray-600">
                  {streakDays} day{streakDays !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-gray-500">Streak</div>
              </div>
            </div>
            <div className="text-blue-600 text-sm">→</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
