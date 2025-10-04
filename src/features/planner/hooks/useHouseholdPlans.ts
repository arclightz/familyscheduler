'use client';

import { useState, useEffect } from 'react';

export interface PlanSummary {
  plan_id: string;
  household_id: string;
  week_start: Date;
  status: 'draft' | 'published';
  created_at: Date;
}

export function useHouseholdPlans(householdId: string | null) {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!householdId) {
      setPlans([]);
      return;
    }

    const fetchPlans = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/households/${householdId}/plans`);
        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }

        const data = await response.json();
        setPlans(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [householdId]);

  const generatePlan = async (weekStart: Date) => {
    if (!householdId) return null;

    try {
      const response = await fetch(`/api/households/${householdId}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week_start: weekStart.toISOString() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate plan');
      }

      const data = await response.json();

      // Refresh plans list
      const listResponse = await fetch(`/api/households/${householdId}/plans`);
      if (listResponse.ok) {
        const listData = await listResponse.json();
        setPlans(listData.data);
      }

      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return {
    plans,
    loading,
    error,
    generatePlan,
  };
}
