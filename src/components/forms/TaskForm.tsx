'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface TaskFormData {
  name: string;
  description: string;
  category: string;
  duration_min: number;
  frequency: {
    type: 'daily' | 'weekly' | 'monthly';
    byWeekday?: number[];
    byMonthDay?: number;
  };
  time_windows: Array<{ start: string; end: string }>;
  fairness_weight: number;
  constraints?: {
    adultsOnly?: boolean;
    minimumAge?: number;
    excludeAllergies?: string[];
    requiredCapabilities?: string[];
  };
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Create Task',
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    duration_min: initialData?.duration_min || 30,
    frequency: initialData?.frequency || { type: 'daily' },
    time_windows: initialData?.time_windows || [],
    fairness_weight: initialData?.fairness_weight || 1,
    constraints: initialData?.constraints || {},
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleWeekday = (day: number) => {
    if (formData.frequency.type !== 'weekly') return;

    const current = formData.frequency.byWeekday || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();

    setFormData({
      ...formData,
      frequency: { ...formData.frequency, byWeekday: updated },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Walk the dog"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the task..."
              />
            </div>

            {/* Category and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Pet Care, Cleaning"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="480"
                  value={formData.duration_min}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_min: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <select
                value={formData.frequency.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frequency: {
                      type: e.target.value as 'daily' | 'weekly' | 'monthly',
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>

              {/* Weekly - Select days */}
              {formData.frequency.type === 'weekly' && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Select days:</p>
                  <div className="flex gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleWeekday(day.value)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          formData.frequency.byWeekday?.includes(day.value)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly - Select day */}
              {formData.frequency.type === 'monthly' && (
                <div className="mt-3">
                  <label className="block text-sm text-gray-600 mb-2">
                    Day of month:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.frequency.byMonthDay || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        frequency: {
                          ...formData.frequency,
                          byMonthDay: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Fairness Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fairness Weight (1-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.fairness_weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fairness_weight: parseInt(e.target.value),
                  })
                }
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher weight = more important for fairness calculation
              </p>
            </div>

            {/* Constraints */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Constraints
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.constraints?.adultsOnly || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        constraints: {
                          ...formData.constraints,
                          adultsOnly: e.target.checked,
                        },
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Adults only</span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Saving...' : submitLabel}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
