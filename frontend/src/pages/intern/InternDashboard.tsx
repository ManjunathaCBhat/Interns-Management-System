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
  // ✅ Use mock data (same pattern as Admin & Profile)
  const intern = mockInterns[0];

  const stats = [
    {
      title: 'Total Tasks',
      value: intern.taskCount,
      icon: ClipboardList,
      color: 'bg-[#7C3AED]/15 text-[#7C3AED]',
    },
    {
      title: 'Completed',
      value: intern.completedTasks,
      icon: CheckCircle,
      color: 'bg-[#9333EA]/15 text-[#9333EA]',
    },
    {
      title: 'Pending',
      value: intern.taskCount - intern.completedTasks,
      icon: Clock,
      color: 'bg-[#5B1AA6]/15 text-[#5B1AA6]',
    },
    {
      title: 'DSU Streak',
      value: intern.dsuStreak,
      icon: Activity,
      color: 'bg-[#3B0F6F]/15 text-[#3B0F6F]',
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
          {stats.map((stat, i) => (
            <Card
              key={i}
              className="hover:shadow-lg transition-shadow"
            >
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
              <CheckCircle className="text-[#7C3AED] h-5 w-5" />
              <span className="text-sm">
                Completed <strong>API Integration</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="text-[#9333EA] h-5 w-5" />
              <span className="text-sm">
                Pending <strong>UI Review</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-[#FF4DA6] h-5 w-5" />
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