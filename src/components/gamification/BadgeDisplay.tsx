import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface BadgeItem {
  badge_id: string;
  key: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'special';
  icon?: string;
  earned_at?: Date;
}

interface BadgeDisplayProps {
  earnedBadges: BadgeItem[];
  availableBadges?: BadgeItem[];
}

const tierColors = {
  bronze: 'bg-orange-700 text-white',
  silver: 'bg-gray-400 text-gray-900',
  gold: 'bg-yellow-500 text-yellow-900',
  special: 'bg-purple-600 text-white',
};

const tierEmojis = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  special: '⭐',
};

/**
 * Display earned and available badges
 */
export function BadgeDisplay({ earnedBadges, availableBadges = [] }: BadgeDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Earned Badges ({earnedBadges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.badge_id}
                  className="flex flex-col items-center p-4 rounded-lg border-2 border-blue-200 bg-blue-50 hover:border-blue-400 transition-colors"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${tierColors[badge.tier]}`}>
                    {badge.icon || tierEmojis[badge.tier]}
                  </div>
                  <h3 className="mt-3 font-semibold text-center text-sm">
                    {badge.name}
                  </h3>
                  <p className="text-xs text-gray-600 text-center mt-1">
                    {badge.description}
                  </p>
                  <Badge variant="default" className="mt-2 text-xs">
                    {badge.tier}
                  </Badge>
                  {badge.earned_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Badges */}
      {availableBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableBadges.map((badge) => (
                <div
                  key={badge.badge_id}
                  className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-60 hover:opacity-80 transition-opacity"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gray-300 text-gray-600">
                    {badge.icon || '🔒'}
                  </div>
                  <h3 className="mt-3 font-semibold text-center text-sm text-gray-700">
                    {badge.name}
                  </h3>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {badge.description}
                  </p>
                  <Badge variant="default" className="mt-2 text-xs">
                    {badge.tier}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {earnedBadges.length === 0 && availableBadges.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Badges Yet
            </h3>
            <p className="text-gray-500">
              Complete tasks to earn your first badge!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
