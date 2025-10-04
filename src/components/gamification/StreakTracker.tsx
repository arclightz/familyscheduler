import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface StreakTrackerProps {
  streakDays: number;
  lastActionDate?: Date | null;
}

/**
 * Visual streak tracker showing daily completion
 */
export function StreakTracker({ streakDays, lastActionDate }: StreakTrackerProps) {
  const today = new Date();
  const daysSinceLastAction = lastActionDate
    ? Math.floor((today.getTime() - new Date(lastActionDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isStreakActive = daysSinceLastAction !== null && daysSinceLastAction <= 1;
  const streakStatus = isStreakActive
    ? streakDays > 0
      ? 'active'
      : 'ready'
    : 'broken';

  // Generate last 14 days for visualization
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (13 - i));
    return date;
  });

  const getStreakForDay = (dayOffset: number): boolean => {
    if (streakDays === 0) return false;
    if (dayOffset === 0 && daysSinceLastAction === 0) return true;
    if (dayOffset === 1 && daysSinceLastAction === 1) return true;
    return dayOffset >= 14 - streakDays && dayOffset < 14 - daysSinceLastAction!;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Streak</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{streakStatus === 'active' ? '🔥' : '❄️'}</span>
            <span className="text-2xl font-bold text-orange-600">{streakDays}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Streak Status Message */}
        <div className="mb-4 p-3 rounded-lg bg-gray-50">
          {streakStatus === 'active' && streakDays > 0 && (
            <p className="text-sm text-green-700 font-medium">
              🎉 {streakDays} day streak! Keep it going!
            </p>
          )}
          {streakStatus === 'ready' && (
            <p className="text-sm text-blue-700 font-medium">
              ⭐ Complete a task today to start your streak!
            </p>
          )}
          {streakStatus === 'broken' && (
            <p className="text-sm text-gray-600 font-medium">
              Streak ended. Complete a task to start fresh!
            </p>
          )}
        </div>

        {/* 14-day Calendar */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, i) => {
            const dayOffset = 13 - i;
            const hasStreak = getStreakForDay(i);
            const isToday = i === 13;

            return (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                    hasStreak
                      ? 'bg-orange-500 text-white shadow-md'
                      : isToday
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {date.getDate()}
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Streak Milestones */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 font-medium mb-2">Milestones</p>
          <div className="flex gap-2">
            {[7, 14, 30, 100].map((milestone) => (
              <div
                key={milestone}
                className={`flex-1 py-2 px-3 rounded text-center ${
                  streakDays >= milestone
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <div className="text-lg font-bold">{milestone}</div>
                <div className="text-xs">
                  {streakDays >= milestone ? '✓' : 'days'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
