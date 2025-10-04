'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { CalendarConnections } from '@/components/calendar/CalendarConnections';
import { ProfileStats } from '@/components/gamification/ProfileStats';
import { BadgeDisplay } from '@/components/gamification/BadgeDisplay';
import { StreakTracker } from '@/components/gamification/StreakTracker';
import { RewardsList } from '@/components/gamification/RewardsList';

// TODO: Replace with actual user ID from auth context
const DEMO_USER_ID = 'user-1';
const DEMO_HOUSEHOLD_ID = 'demo-household';

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
      badge_id: string;
      key: string;
      name: string;
      tier: 'bronze' | 'silver' | 'gold' | 'special';
      description: string;
      icon?: string;
    };
    earned_at: Date;
  }>;
}

interface Reward {
  reward_id: string;
  name: string;
  description: string | null;
  min_level: number;
  cost_points: number;
  required_badges: string[];
  cooldown_days: number | null;
  active: boolean;
}

export function ProfileContent() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);

  useEffect(() => {
    // Check for OAuth callback notifications
    const calendarConnected = searchParams.get('calendar_connected');
    const errorParam = searchParams.get('error');

    if (calendarConnected) {
      setNotification({
        type: 'success',
        message: `${calendarConnected === 'google' ? 'Google' : 'Microsoft'} Calendar connected successfully!`,
      });
      setTimeout(() => setNotification(null), 5000);
    } else if (errorParam) {
      const errorMessages: Record<string, string> = {
        google_auth_failed: 'Google Calendar authorization failed',
        google_connection_failed: 'Failed to connect Google Calendar',
        microsoft_auth_failed: 'Microsoft Calendar authorization failed',
        microsoft_connection_failed: 'Failed to connect Microsoft Calendar',
      };
      setNotification({
        type: 'error',
        message: errorMessages[errorParam] || 'An error occurred',
      });
      setTimeout(() => setNotification(null), 5000);
    }

    const fetchData = async () => {
      try {
        // Fetch gamification profile
        const profileRes = await fetch(
          `/api/gamification/profile?user_id=${DEMO_USER_ID}`
        );
        if (!profileRes.ok) {
          throw new Error('Failed to fetch profile');
        }
        const profileData = await profileRes.json();
        setProfile(profileData.data);

        // TODO: Fetch rewards from API when endpoint is created
        // For now, use mock data
        setRewards([
          {
            reward_id: '1',
            name: 'Extra Screen Time',
            description: '30 minutes of bonus screen time',
            min_level: 2,
            cost_points: 0,
            required_badges: [],
            cooldown_days: 7,
            active: true,
          },
          {
            reward_id: '2',
            name: 'Pizza Night',
            description: 'Choose what pizza we order',
            min_level: 3,
            cost_points: 0,
            required_badges: [],
            cooldown_days: 14,
            active: true,
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleRedeemReward = async (rewardId: string) => {
    setRedeemLoading(true);
    try {
      // TODO: Implement actual redemption API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setNotification({
        type: 'success',
        message: 'Reward request submitted! Awaiting parent approval.',
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Failed to redeem reward. Please try again.',
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setRedeemLoading(false);
    }
  };

  const calculateNextLevelXP = (level: number): number => {
    const thresholds = [0, 100, 300, 700, 1500, 3000];
    return thresholds[level] || thresholds[thresholds.length - 1] * 2;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">
          Track your progress, achievements, and rewards
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {notification.message}
        </div>
      )}

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
        <div className="space-y-8">
          {/* Profile Stats */}
          <ProfileStats
            xp={profile.xp}
            level={profile.level}
            streakDays={profile.streak_days}
            nextLevelXp={calculateNextLevelXP(profile.level)}
          />

          {/* Streak Tracker */}
          <StreakTracker
            streakDays={profile.streak_days}
            lastActionDate={profile.last_action}
          />

          {/* Badges */}
          <BadgeDisplay
            earnedBadges={profile.badges.map((eb) => ({
              ...eb.badge,
              earned_at: eb.earned_at,
            }))}
          />

          {/* Rewards */}
          <RewardsList
            rewards={rewards}
            userLevel={profile.level}
            onRedeem={handleRedeemReward}
            isLoading={redeemLoading}
          />

          {/* Calendar Integrations */}
          <CalendarConnections userId={DEMO_USER_ID} />
        </div>
      )}
    </div>
  );
}
