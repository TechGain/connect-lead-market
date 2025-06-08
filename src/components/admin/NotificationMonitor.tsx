
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationAttempt {
  id: string;
  lead_id: string;
  notification_type: 'email' | 'sms';
  status: 'pending' | 'success' | 'failed' | 'retrying';
  attempt_count: number;
  error_details?: string;
  function_response?: any;
  attempted_at: string;
  completed_at?: string;
}

interface NotificationStats {
  total_attempts: number;
  successful_attempts: number;
  failed_attempts: number;
  pending_attempts: number;
  success_rate: number;
}

const NotificationMonitor: React.FC = () => {
  const [attempts, setAttempts] = useState<NotificationAttempt[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotificationData = async () => {
    try {
      setIsLoading(true);

      // Fetch recent notification attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('notification_attempts')
        .select('*')
        .order('attempted_at', { ascending: false })
        .limit(50);

      if (attemptsError) {
        console.error('Error fetching notification attempts:', attemptsError);
        toast.error('Failed to load notification attempts');
        return;
      }

      // Fetch notification statistics
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_notification_stats');

      if (statsError) {
        console.error('Error fetching notification stats:', statsError);
        toast.error('Failed to load notification statistics');
        return;
      }

      setAttempts(attemptsData || []);
      setStats(statsData?.[0] || null);

    } catch (error) {
      console.error('Exception fetching notification data:', error);
      toast.error('Failed to load notification data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'retrying':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-500',
      failed: 'bg-red-500',
      pending: 'bg-yellow-500',
      retrying: 'bg-blue-500'
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants] || 'bg-gray-500'} text-white`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading notification data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_attempts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successful_attempts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed_attempts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_attempts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.success_rate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Attempts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Notification Attempts</CardTitle>
          <Button onClick={fetchNotificationData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No notification attempts found</p>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => (
                <div key={attempt.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(attempt.status)}
                      <span className="font-medium">Lead {attempt.lead_id.slice(0, 8)}</span>
                      <Badge variant="outline">{attempt.notification_type.toUpperCase()}</Badge>
                      {getStatusBadge(attempt.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(attempt.attempted_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Attempt {attempt.attempt_count}
                    {attempt.completed_at && (
                      <span className="ml-2">
                        • Completed: {new Date(attempt.completed_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {attempt.error_details && (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-red-700 text-sm font-medium">Error:</p>
                      <p className="text-red-600 text-xs">{attempt.error_details}</p>
                    </div>
                  )}
                  
                  {attempt.function_response && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500">Function Response</summary>
                      <pre className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(attempt.function_response, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationMonitor;
