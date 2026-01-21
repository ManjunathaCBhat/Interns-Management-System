import React from 'react';
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity,
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import Avatar from '@/components/shared/Avatar';
import { mockInterns } from '@/data/mockData';

const InternDashboard: React.FC = () => {
  // Mock intern
  const intern = mockInterns[0];

  // ✅ SAFE mock stats (because MockIntern doesn't have task fields)
  const totalTasks = 12;
  const completedTasks = 7;
  const pendingTasks = totalTasks - completedTasks;
  const dsuStreak = 5;

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: ClipboardList,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Pending',
      value: pendingTasks,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'DSU Streak',
      value: dsuStreak,
      icon: Activity,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar name={intern.name} size="lg" />
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {intern.name}
            </h1>
            <p className="text-muted-foreground">
              {intern.domain} • {intern.currentProject}
            </p>
            <div className="mt-2">
              <StatusBadge status={intern.status} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={`h-10 w-10 flex items-center justify-center rounded-lg ${stat.color}`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">
                Completed <strong>API Integration</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">
                Pending <strong>UI Review</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm">
                Blocker: <strong>Waiting for credentials</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternDashboard;