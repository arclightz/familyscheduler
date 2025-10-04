'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { AuditLog } from '@/features/admin/types';
import { FileEdit, Trash2, Plus, CheckCircle } from 'lucide-react';

interface AuditLogListProps {
  logs: AuditLog[];
}

const actionIcons = {
  create: Plus,
  update: FileEdit,
  delete: Trash2,
  publish: CheckCircle,
};

const actionColors = {
  create: 'bg-green-100 text-green-600',
  update: 'bg-blue-100 text-blue-600',
  delete: 'bg-red-100 text-red-600',
  publish: 'bg-purple-100 text-purple-600',
};

export function AuditLogList({ logs }: AuditLogListProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No activity logs found</p>
        ) : (
          logs.map((log) => {
            const Icon = actionIcons[log.action as keyof typeof actionIcons] || FileEdit;
            const colorClass = actionColors[log.action as keyof typeof actionColors] || actionColors.update;

            return (
              <div key={log.audit_id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {log.action}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{log.entity_type}</span>
                  </div>
                  <p className="text-sm mt-1">
                    <span className="font-medium">{log.entity_id}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                  {log.user_agent && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {log.user_agent}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
