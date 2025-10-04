'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// TODO: Replace with actual user ID from auth context
const DEMO_USER_ID = 'user-1';

interface GamificationProfile {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  streak_days: number;
  last_action: Date | null;
  badges: Array<{
    id: string;
    badge: {
      key: string;
      name: string;
      tier: string;
      description: string;
    };
    earned_at: Date;
  }>;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `/api/gamification/profile?user_id=${DEMO_USER_ID}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const calculateNextLevel = (currentXP: number, currentLevel: number) => {
    // Level thresholds from seed data
    const thresholds = [0, 100, 300, 700, 1500, 3000];
    const nextThreshold = thresholds[currentLevel] || thresholds[thresholds.length - 1] * 2;
    const prevThreshold = thresholds[currentLevel - 1] || 0;
    const progress = ((currentXP - prevThreshold) / (nextThreshold - prevThreshold)) * 100;

    return {
      nextThreshold,
      prevThreshold,
      progress: Math.min(progress, 100),
      xpNeeded: Math.max(0, nextThreshold - currentXP),
    };
  };

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">
              Track your progress and achievements
            </p>
          </div>

          {loading && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Loading profile...</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-red-600">Error: {error}</p>
              </CardContent>
            </Card>
          )}

          {profile && (
            <div className="space-y-6">
              {/* XP and Level */}
              <Card>
                <CardHeader>
                  <CardTitle>Level & Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold text-blue-600 mb-2">
                      Level {profile.level}
                    </div>
                    <div className="text-2xl font-semibold text-gray-700">
                      {profile.xp} XP
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(() => {
                    const levelData = calculateNextLevel(profile.xp, profile.level);
                    return (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Level {profile.level}</span>
                          <span>
                            {levelData.xpNeeded} XP to Level {profile.level + 1}
                          </span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                            style={{ width: `${levelData.progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Streak */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl mb-2">🔥</div>
                      <div className="text-4xl font-bold text-orange-600">
                        {profile.streak_days}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {profile.streak_days === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                  </div>
                  {profile.last_action && (
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Last activity:{' '}
                      {new Date(profile.last_action).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Badges ({profile.badges?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!profile.badges || profile.badges.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">No badges earned yet</p>
                      <p className="text-sm">
                        Complete tasks to earn your first badge!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.badges.map((earnedBadge) => (
                        <div
                          key={earnedBadge.id}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">
                                {earnedBadge.badge.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {earnedBadge.badge.description}
                              </p>
                            </div>
                            <Badge
                              variant={
                                earnedBadge.badge.tier === 'gold'
                                  ? 'warning'
                                  : earnedBadge.badge.tier === 'silver'
                                    ? 'default'
                                    : 'info'
                              }
                            >
                              {earnedBadge.badge.tier}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Earned{' '}
                            {new Date(earnedBadge.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">
                        {profile.level}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Level</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {profile.badges?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Badges</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600">
                        {profile.streak_days}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Streak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
