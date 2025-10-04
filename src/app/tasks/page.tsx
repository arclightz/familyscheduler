'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Task {
  task_id: string;
  household_id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_min: number;
  frequency: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    byWeekday?: number[];
    byMonthDay?: number;
    cron?: string;
  };
  fairness_weight: number;
  active: boolean;
}

// TODO: Replace with actual household ID from auth context
const DEMO_HOUSEHOLD_ID = 'demo-household';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/households/${DEMO_HOUSEHOLD_ID}/tasks`);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getFrequencyLabel = (frequency: Task['frequency']): string => {
    if (frequency.type === 'daily') return 'Daily';
    if (frequency.type === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekdays = frequency.byWeekday || [];
      return `Weekly (${weekdays.map((d) => days[d]).join(', ')})`;
    }
    if (frequency.type === 'monthly') {
      return `Monthly (day ${frequency.byMonthDay})`;
    }
    return 'Custom';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-2">
              Manage your household tasks and their schedules
            </p>
          </div>
          <Link href={"/planner" as any} className="inline-block">
            <Button variant="outline">← Back to Planner</Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Loading tasks...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-600">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Tasks Grid */}
        {!loading && !error && (
          <>
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No tasks found. Create one to get started!</p>
                  <Button className="mt-4">Create Task</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <Card key={task.task_id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{task.name}</CardTitle>
                        <Badge variant={task.active ? 'success' : 'default'}>
                          {task.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-4">
                          {task.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-medium">{task.duration_min} min</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Frequency</span>
                          <span className="font-medium">
                            {getFrequencyLabel(task.frequency)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Fairness Weight</span>
                          <span className="font-medium">
                            {task.fairness_weight}x
                          </span>
                        </div>

                        {task.category && (
                          <div className="pt-2 border-t">
                            <Badge variant="info">{task.category}</Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Stats */}
            {tasks.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {tasks.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Tasks</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {tasks.filter((t) => t.active).length}
                      </div>
                      <div className="text-sm text-gray-600">Active</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {tasks.filter((t) => t.frequency.type === 'daily').length}
                      </div>
                      <div className="text-sm text-gray-600">Daily Tasks</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(
                          tasks.reduce((sum, t) => sum + t.duration_min, 0) / 60
                        )}h
                      </div>
                      <div className="text-sm text-gray-600">Weekly Hours</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
