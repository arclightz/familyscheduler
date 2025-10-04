'use client';

import { useState, useEffect } from 'react';

export interface Plan {
  plan_id: string;
  household_id: string;
  week_start: Date;
  status: 'draft' | 'published';
  created_at: Date;
  assignments: Array<{
    assignment_id: string;
    task: {
      task_id: string;
      name: string;
      description: string | null;
      category: string | null;
      duration_min: number;
    };
    user: {
      user_id: string;
      name: string | null;
      email: string;
    };
    start_at: Date;
    end_at: Date;
    status: 'pending' | 'done' | 'skipped';
    notes: string | null;
  }>;
  household: {
    household_id: string;
    name: string;
  };
}

export function usePlan(planId: string | null) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setPlan(null);
      return;
    }

    const fetchPlan = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/plans/${planId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch plan');
        }

        const data = await response.json();
        setPlan(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  const updateAssignmentStatus = async (
    assignmentId: string,
    status: 'pending' | 'done' | 'skipped'
  ) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update assignment');
      }

      // Update local state
      if (plan) {
        setPlan({
          ...plan,
          assignments: plan.assignments.map((a) =>
            a.assignment_id === assignmentId ? { ...a, status } : a
          ),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const publishPlan = async () => {
    if (!plan) return;

    try {
      const response = await fetch(`/api/plans/${plan.plan_id}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to publish plan');
      }

      setPlan({ ...plan, status: 'published' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return {
    plan,
    loading,
    error,
    updateAssignmentStatus,
    publishPlan,
  };
}
