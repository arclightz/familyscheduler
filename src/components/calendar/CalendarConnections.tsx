'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface CalendarConnection {
  id: string;
  provider: 'google' | 'microsoft';
  account_id: string;
}

interface CalendarConnectionsProps {
  userId: string;
}

export function CalendarConnections({ userId }: CalendarConnectionsProps) {
  const [connections, setConnections] = useState<CalendarConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
  }, [userId]);

  const fetchConnections = async () => {
    try {
      const response = await fetch(`/api/calendar/connections?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Failed to fetch calendar connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: 'google' | 'microsoft') => {
    setConnecting(provider);
    try {
      const response = await fetch(`/api/calendar/connect/${provider}`);
      const data = await response.json();

      if (data.authUrl) {
        // Redirect to OAuth flow
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error(`Failed to connect ${provider}:`, error);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this calendar?')) {
      return;
    }

    try {
      const response = await fetch('/api/calendar/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: connectionId }),
      });

      if (response.ok) {
        setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      }
    } catch (error) {
      console.error('Failed to disconnect calendar:', error);
    }
  };

  const getProviderName = (provider: string) => {
    return provider === 'google' ? 'Google Calendar' : 'Microsoft Calendar';
  };

  const isConnected = (provider: 'google' | 'microsoft') => {
    return connections.some((c) => c.provider === provider);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Loading calendar connections...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Integrations</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Connect your calendars to automatically sync events and availability
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Google Calendar */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <h4 className="font-medium">Google Calendar</h4>
                <p className="text-sm text-gray-600">
                  {isConnected('google')
                    ? connections.find((c) => c.provider === 'google')?.account_id
                    : 'Not connected'}
                </p>
              </div>
            </div>
            <div>
              {isConnected('google') ? (
                <div className="flex items-center gap-2">
                  <Badge variant="success">Connected</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleDisconnect(
                        connections.find((c) => c.provider === 'google')!.id
                      )
                    }
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleConnect('google')}
                  disabled={connecting === 'google'}
                >
                  {connecting === 'google' ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </div>
          </div>

          {/* Microsoft Calendar */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">📆</span>
              </div>
              <div>
                <h4 className="font-medium">Microsoft Calendar</h4>
                <p className="text-sm text-gray-600">
                  {isConnected('microsoft')
                    ? connections.find((c) => c.provider === 'microsoft')
                        ?.account_id
                    : 'Not connected'}
                </p>
              </div>
            </div>
            <div>
              {isConnected('microsoft') ? (
                <div className="flex items-center gap-2">
                  <Badge variant="success">Connected</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleDisconnect(
                        connections.find((c) => c.provider === 'microsoft')!.id
                      )
                    }
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleConnect('microsoft')}
                  disabled={connecting === 'microsoft'}
                >
                  {connecting === 'microsoft' ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {connections.length === 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Connecting your calendar helps us avoid
              scheduling tasks when you're busy or away.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
