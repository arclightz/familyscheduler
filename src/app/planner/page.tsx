'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Header } from '@/components/layout/Header';
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
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-purple-50/30">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-extrabold text-secondary-900 mb-2">Weekly Planner</h1>
            <p className="text-lg text-secondary-600">
              Manage your household tasks and assignments with smart scheduling
            </p>
          </div>

          {/* Plans List Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  variant="gradient"
                  className="w-full mb-4"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </span>
                  ) : (
                    '+ Generate New Plan'
                  )}
                </Button>

                {plansLoading ? (
                  <div className="flex items-center gap-2 text-sm text-secondary-500">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    Loading plans...
                  </div>
                ) : plans.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-sm text-secondary-500 font-medium">
                      No plans yet. Generate one to get started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {plans.map((p) => (
                      <button
                        key={p.plan_id}
                        onClick={() => setSelectedPlanId(p.plan_id)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                          selectedPlanId === p.plan_id
                            ? 'border-primary-500 bg-primary-50 shadow-soft'
                            : 'border-secondary-200 hover:border-primary-300 hover:bg-secondary-50'
                        }`}
                      >
                        <div className="text-sm font-semibold text-secondary-900">
                          {new Date(p.week_start).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <Badge
                          variant={p.status === 'published' ? 'success' : 'warning'}
                          size="sm"
                          dot
                          className="mt-2"
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
              <Card className="border-2 border-dashed border-secondary-300">
                <CardContent className="py-16 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2">No Plan Selected</h3>
                  <p className="text-secondary-600 max-w-md mx-auto">
                    Select an existing plan from the sidebar or generate a new one to get started
                  </p>
                </CardContent>
              </Card>
            )}

            {planLoading && (
              <Card className="border-2">
                <CardContent className="py-16 text-center">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-secondary-600 font-medium">Loading plan...</p>
                </CardContent>
              </Card>
            )}

            {plan && (
              <>
                {/* Plan Header */}
                <Card className="border-2 border-primary-200" gradient>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">
                          Week of{' '}
                          {new Date(plan.week_start).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </CardTitle>
                        <p className="text-base text-secondary-600 font-medium flex items-center gap-2">
                          <span className="w-2 h-2 bg-accent-green-500 rounded-full"></span>
                          {plan.household.name}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge
                          variant={plan.status === 'published' ? 'success' : 'warning'}
                          size="lg"
                          dot
                        >
                          {plan.status.toUpperCase()}
                        </Badge>
                        {plan.status === 'draft' && (
                          <Button size="sm" variant="success" onClick={handlePublishPlan}>
                            Publish Plan
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 text-center border-2 border-primary-200 shadow-soft">
                        <div className="text-3xl font-extrabold text-primary-600 mb-1">
                          {plan.assignments.length}
                        </div>
                        <div className="text-sm font-semibold text-secondary-600">Total Tasks</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center border-2 border-accent-green-200 shadow-soft">
                        <div className="text-3xl font-extrabold text-accent-green-600 mb-1">
                          {plan.assignments.filter((a) => a.status === 'done').length}
                        </div>
                        <div className="text-sm font-semibold text-secondary-600">Completed</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center border-2 border-secondary-200 shadow-soft">
                        <div className="text-3xl font-extrabold text-secondary-600 mb-1">
                          {plan.assignments.filter((a) => a.status === 'pending').length}
                        </div>
                        <div className="text-sm font-semibold text-secondary-600">Pending</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fairness Meter */}
                {workloads.length > 0 && <FairnessMeter workloads={workloads} />}

                {/* Weekly Calendar */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      Weekly Schedule
                    </CardTitle>
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
    </>
  );
}
