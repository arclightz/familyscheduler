'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { WeeklyCalendar } from '@/features/planner/components/WeeklyCalendar';
import { FairnessMeter } from '@/features/planner/components/FairnessMeter';
import { usePlan } from '@/features/planner/hooks/usePlan';
import { useHouseholdPlans } from '@/features/planner/hooks/useHouseholdPlans';

// TODO: Replace with actual household ID from auth context
const DEMO_HOUSEHOLD_ID = 'demo-household';

export default function PlannerPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { plans, loading: plansLoading, generatePlan } = useHouseholdPlans(DEMO_HOUSEHOLD_ID);
  const { plan, loading: planLoading, updateAssignmentStatus, publishPlan } = usePlan(selectedPlanId);

  // Calculate workload distribution
  const workloads = useMemo(() => {
    if (!plan) return [];

    const userWorkloads = new Map<string, {
      user_id: string;
      name: string | null;
      email: string;
      total_minutes: number;
      task_count: number;
    }>();

    plan.assignments.forEach((assignment) => {
      const existing = userWorkloads.get(assignment.user.user_id);
      if (existing) {
        existing.total_minutes += assignment.task.duration_min;
        existing.task_count += 1;
      } else {
        userWorkloads.set(assignment.user.user_id, {
          user_id: assignment.user.user_id,
          name: assignment.user.name,
          email: assignment.user.email,
          total_minutes: assignment.task.duration_min,
          task_count: 1,
        });
      }
    });

    return Array.from(userWorkloads.values()).sort(
      (a, b) => b.total_minutes - a.total_minutes
    );
  }, [plan]);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      // Get next Monday
      const now = new Date();
      const daysUntilMonday = (1 - now.getDay() + 7) % 7;
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);

      const result = await generatePlan(nextMonday);
      if (result?.plan_id) {
        setSelectedPlanId(result.plan_id);
      }
    } catch (error) {
      console.error('Failed to generate plan:', error);
      alert('Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishPlan = async () => {
    try {
      await publishPlan();
      alert('Plan published successfully!');
    } catch (error) {
      console.error('Failed to publish plan:', error);
      alert('Failed to publish plan. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Weekly Planner</h1>
          <p className="text-gray-600 mt-2">
            Manage your household tasks and assignments
          </p>
        </div>

        {/* Plans List Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="w-full mb-4"
                >
                  {isGenerating ? 'Generating...' : 'Generate New Plan'}
                </Button>

                {plansLoading ? (
                  <div className="text-sm text-gray-500">Loading plans...</div>
                ) : plans.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No plans yet. Generate one to get started!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {plans.map((p) => (
                      <button
                        key={p.plan_id}
                        onClick={() => setSelectedPlanId(p.plan_id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedPlanId === p.plan_id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium">
                          {new Date(p.week_start).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <Badge
                          variant={p.status === 'published' ? 'success' : 'warning'}
                          className="mt-1"
                        >
                          {p.status}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {!plan && !planLoading && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">
                    Select a plan from the sidebar or generate a new one
                  </p>
                </CardContent>
              </Card>
            )}

            {planLoading && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">Loading plan...</p>
                </CardContent>
              </Card>
            )}

            {plan && (
              <>
                {/* Plan Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>
                          Week of{' '}
                          {new Date(plan.week_start).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {plan.household.name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          variant={plan.status === 'published' ? 'success' : 'warning'}
                        >
                          {plan.status}
                        </Badge>
                        {plan.status === 'draft' && (
                          <Button size="sm" onClick={handlePublishPlan}>
                            Publish
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {plan.assignments.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Tasks</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {plan.assignments.filter((a) => a.status === 'done').length}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-600">
                          {plan.assignments.filter((a) => a.status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-600">Pending</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fairness Meter */}
                {workloads.length > 0 && <FairnessMeter workloads={workloads} />}

                {/* Weekly Calendar */}
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WeeklyCalendar
                      weekStart={new Date(plan.week_start)}
                      assignments={plan.assignments}
                      onStatusChange={updateAssignmentStatus}
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
