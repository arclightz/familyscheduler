'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/admin/MetricCard';
import { HouseholdTable } from '@/components/admin/HouseholdTable';
import { AuditLogList } from '@/components/admin/AuditLogList';
import { Users, Home, ListTodo, Calendar, CheckCircle, TrendingUp } from 'lucide-react';
import type { SystemMetrics, HouseholdStats, AuditLog } from '@/features/admin/types';

export default function AdminPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [households, setHouseholds] = useState<HouseholdStats[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, householdsRes, logsRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/households'),
        fetch('/api/admin/audit-logs?limit=20'),
      ]);

      const metricsData = await metricsRes.json();
      const householdsData = await householdsRes.json();
      const logsData = await logsRes.json();

      setMetrics(metricsData.metrics);
      setHouseholds(householdsData.households);
      setAuditLogs(logsData.logs);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">System overview and management</p>
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={metrics.total_users}
            icon={Users}
            description="Registered users"
          />
          <MetricCard
            title="Households"
            value={metrics.total_households}
            icon={Home}
            description="Active households"
          />
          <MetricCard
            title="Active Tasks"
            value={metrics.total_tasks}
            icon={ListTodo}
            description="Tasks in rotation"
          />
          <MetricCard
            title="Published Plans"
            value={metrics.active_plans}
            icon={Calendar}
            description={`${metrics.total_plans} total plans`}
          />
          <MetricCard
            title="Completed Today"
            value={metrics.completed_assignments_today}
            icon={CheckCircle}
            description="Tasks completed"
          />
          <MetricCard
            title="This Week"
            value={metrics.completed_assignments_week}
            icon={TrendingUp}
            description="Tasks completed"
          />
        </div>
      )}

      {/* Households Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Households</h2>
        <HouseholdTable households={households} />
      </div>

      {/* Audit Logs */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Activity Log</h2>
        <AuditLogList logs={auditLogs} />
      </div>
    </div>
  );
}
