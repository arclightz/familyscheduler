import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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

interface RewardsListProps {
  rewards: Reward[];
  userLevel: number;
  onRedeem: (rewardId: string) => void;
  isLoading?: boolean;
}

/**
 * Display available rewards and redemption options
 */
export function RewardsList({
  rewards,
  userLevel,
  onRedeem,
  isLoading = false,
}: RewardsListProps) {
  const canRedeem = (reward: Reward): boolean => {
    if (!reward.active) return false;
    if (userLevel < reward.min_level) return false;
    // TODO: Check badge requirements
    return true;
  };

  const getRewardIcon = (name: string): string => {
    if (name.toLowerCase().includes('movie')) return '🎬';
    if (name.toLowerCase().includes('pizza')) return '🍕';
    if (name.toLowerCase().includes('ice cream')) return '🍦';
    if (name.toLowerCase().includes('game')) return '🎮';
    if (name.toLowerCase().includes('screen')) return '📱';
    if (name.toLowerCase().includes('allowance')) return '💰';
    return '🎁';
  };

  const activeRewards = rewards.filter((r) => r.active);
  const availableRewards = activeRewards.filter((r) => canRedeem(r));
  const lockedRewards = activeRewards.filter((r) => !canRedeem(r));

  return (
    <div className="space-y-6">
      {/* Available Rewards */}
      {availableRewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableRewards.map((reward) => (
                <div
                  key={reward.reward_id}
                  className="border-2 border-green-200 rounded-lg p-4 bg-green-50 hover:border-green-400 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{getRewardIcon(reward.name)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{reward.name}</h3>
                      {reward.description && (
                        <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="default" className="text-xs">
                          Level {reward.min_level}+
                        </Badge>
                        {reward.cost_points > 0 && (
                          <Badge variant="default" className="text-xs">
                            {reward.cost_points} pts
                          </Badge>
                        )}
                        {reward.cooldown_days && (
                          <Badge variant="default" className="text-xs">
                            {reward.cooldown_days}d cooldown
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => onRedeem(reward.reward_id)}
                        disabled={isLoading}
                        size="sm"
                        className="mt-3 w-full"
                      >
                        {isLoading ? 'Requesting...' : 'Redeem'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locked Rewards */}
      {lockedRewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Locked Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lockedRewards.map((reward) => (
                <div
                  key={reward.reward_id}
                  className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 opacity-60"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-4xl grayscale">
                      {getRewardIcon(reward.name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-700">
                        {reward.name}
                      </h3>
                      {reward.description && (
                        <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge
                          variant="default"
                          className={`text-xs ${
                            userLevel < reward.min_level ? 'border-red-300 text-red-600' : ''
                          }`}
                        >
                          Level {reward.min_level}+
                        </Badge>
                        {reward.cost_points > 0 && (
                          <Badge variant="default" className="text-xs">
                            {reward.cost_points} pts
                          </Badge>
                        )}
                      </div>
                      {userLevel < reward.min_level && (
                        <p className="text-xs text-red-600 mt-2">
                          Unlock at level {reward.min_level}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {activeRewards.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Rewards Available
            </h3>
            <p className="text-gray-500">
              Check back later for exciting rewards!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
