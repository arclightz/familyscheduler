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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Level Card */}
      <Card className="border-2 border-primary-200 overflow-hidden" hover>
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-4">
          <CardTitle className="text-sm text-white/90 font-semibold mb-2">Level</CardTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-white drop-shadow-lg">{level}</span>
            <span className="text-white/70 text-lg font-medium">/ ∞</span>
          </div>
        </div>
        <CardContent className="bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-1">
              <div className="h-2 bg-primary-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                  style={{ width: `${Math.min((xp / nextLevelXp) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-secondary-600 mt-2 font-semibold">
            {xpToNextLevel} XP to level {level + 1}
          </p>
        </CardContent>
      </Card>

      {/* XP Card */}
      <Card className="border-2 border-accent-purple-200 overflow-hidden" hover>
        <div className="bg-gradient-to-br from-accent-purple-500 to-accent-purple-600 p-4">
          <CardTitle className="text-sm text-white/90 font-semibold mb-2">Experience Points</CardTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-white drop-shadow-lg">{xp}</span>
            <span className="text-white/70 text-lg font-medium">XP</span>
          </div>
        </div>
        <CardContent className="bg-gradient-to-br from-accent-purple-50 to-white">
          <div className="mt-2">
            <div className="h-3 bg-accent-purple-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-accent-purple-500 to-accent-purple-600 transition-all duration-500 shadow-glow-purple"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-xs text-secondary-600 mt-2 font-semibold">
              {Math.round(xpProgress)}% progress to next level
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Streak Card */}
      <Card className="border-2 border-accent-orange-200 overflow-hidden" hover>
        <div className="bg-gradient-to-br from-accent-orange-500 to-accent-orange-600 p-4">
          <CardTitle className="text-sm text-white/90 font-semibold mb-2">Streak</CardTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-white drop-shadow-lg">{streakDays}</span>
            <span className="text-white/70 text-lg font-medium">days</span>
          </div>
        </div>
        <CardContent className="bg-gradient-to-br from-accent-orange-50 to-white">
          <div className="flex gap-1.5 mt-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full transition-all duration-300 ${
                  i < (streakDays % 7)
                    ? 'bg-gradient-to-t from-accent-orange-500 to-accent-orange-600 shadow-soft'
                    : 'bg-secondary-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-secondary-600 mt-2 font-semibold">
            {streakDays > 0 ? '🔥 Keep the momentum going!' : 'Complete a task to start your streak'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
