import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface ProfileStatsProps {
  xp: number;
  level: number;
  streakDays: number;
  nextLevelXp: number;
}

/**
 * Display gamification profile statistics
 */
export function ProfileStats({ xp, level, streakDays, nextLevelXp }: ProfileStatsProps) {
  const xpProgress = ((xp % 1000) / 1000) * 100;
  const xpToNextLevel = nextLevelXp - xp;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Level Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-blue-600">{level}</span>
            <span className="text-gray-500">/ ∞</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {xpToNextLevel} XP to level {level + 1}
          </p>
        </CardContent>
      </Card>

      {/* XP Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-purple-600">{xp}</span>
            <span className="text-gray-500">XP</span>
          </div>
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(xpProgress)}% to next level</p>
          </div>
        </CardContent>
      </Card>

      {/* Streak Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-orange-600">{streakDays}</span>
            <span className="text-gray-500">days</span>
          </div>
          <div className="flex gap-1 mt-3">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded ${
                  i < (streakDays % 7)
                    ? 'bg-orange-600'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {streakDays > 0 ? 'Keep it going!' : 'Complete a task to start'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
