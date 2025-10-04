'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Bell, Plus, Trash2 } from 'lucide-react';
import type { ReminderSchedule } from '@/features/notifications/types';

export function ReminderSettings() {
  const [schedules, setSchedules] = useState<ReminderSchedule[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      setSchedules(data.schedules);
    } catch (error) {
      console.error('Failed to fetch reminder schedules:', error);
    }
  };

  const toggleSchedule = async (scheduleId: string, enabled: boolean) => {
    try {
      await fetch(`/api/reminders/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      fetchSchedules();
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      await fetch(`/api/reminders/${scheduleId}`, { method: 'DELETE' });
      fetchSchedules();
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const createSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frequency: formData.get('frequency'),
          time: formData.get('time') || undefined,
          offset_min: formData.get('offset_min')
            ? parseInt(formData.get('offset_min') as string)
            : undefined,
          channels: ['push'],
        }),
      });
      fetchSchedules();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: 'Daily Summary',
      before_task: 'Before Task',
      weekly_summary: 'Weekly Summary',
    };
    return labels[frequency] || frequency;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reminder Settings</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-4">
          <form onSubmit={createSchedule} className="space-y-4">
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <select
                id="frequency"
                name="frequency"
                className="w-full mt-1 p-2 border rounded-md"
                required
              >
                <option value="daily">Daily Summary</option>
                <option value="before_task">Before Task</option>
                <option value="weekly_summary">Weekly Summary</option>
              </select>
            </div>

            <div>
              <Label htmlFor="time">Time (for daily/weekly)</Label>
              <Input
                id="time"
                name="time"
                type="time"
                className="mt-1"
                placeholder="08:00"
              />
            </div>

            <div>
              <Label htmlFor="offset_min">Minutes Before Task (for before_task)</Label>
              <Input
                id="offset_min"
                name="offset_min"
                type="number"
                className="mt-1"
                placeholder="15"
                min="5"
                max="120"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Create
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {schedules.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No reminder schedules configured</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {schedules.map((schedule) => (
            <Card key={schedule.schedule_id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{getFrequencyLabel(schedule.frequency)}</h3>
                    {schedule.enabled ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="default">Disabled</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {schedule.time && `Time: ${schedule.time}`}
                    {schedule.offset_min && `${schedule.offset_min} minutes before task`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Channels: {(schedule.channels as string[]).join(', ')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={(checked) =>
                      toggleSchedule(schedule.schedule_id, checked)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSchedule(schedule.schedule_id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
