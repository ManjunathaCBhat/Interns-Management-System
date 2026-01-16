import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Activity,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import Avatar from '@/components/shared/Avatar';
import { mockInterns, mockDSUEntries } from '@/data/mockData';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Calculate stats
  const totalInterns = mockInterns.length;
  const projectInterns = mockInterns.filter((i) => i.internType === 'project').length;
  const rsInterns = mockInterns.filter((i) => i.internType === 'rs').length;
  const paidInterns = mockInterns.filter((i) => i.isPaid).length;
  const activeInterns = mockInterns.filter((i) => i.status === 'active').length;
  const trainingInterns = mockInterns.filter((i) => i.status === 'training').length;

  const todaysDSUs = mockDSUEntries.filter(
    (d) => d.date === new Date().toISOString().split('T')[0]
  );
  const submittedDSUs = todaysDSUs.filter((d) => d.status === 'submitted').length;
  const dsuCompletion = Math.round((submittedDSUs / activeInterns) * 100) || 0;

  const blockedInterns = todaysDSUs.filter(
    (d) => d.blockers && d.blockers.length > 0
  );

  const recentActivity = [
    { action: 'DSU Submitted', user: 'Priya Sharma', time: '2 min ago' },
    { action: 'Task Completed', user: 'Arjun Patel', time: '15 min ago' },
    { action: 'New Intern Added', user: 'Karthik Nair', time: '1 hour ago' },
    { action: 'Feedback Given', user: 'Rahul Verma', time: '2 hours ago' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name?.split(' ')[0]}. Here's what's happening today.
            </p>
          </div>
          <Button variant="accent" asChild>
            <Link to="/admin/interns">
              Manage Interns
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Interns"
            value={totalInterns}
            subtitle={`${activeInterns} active`}
            icon={Users}
          />
          <StatCard
            title="Project / RS"
            value={`${projectInterns} / ${rsInterns}`}
            subtitle="Intern types"
            icon={Briefcase}
          />
          <StatCard
            title="Paid Interns"
            value={paidInterns}
            subtitle={`${totalInterns - paidInterns} unpaid`}
            icon={UserCheck}
          />
          <StatCard
            title="DSU Completion"
            value={`${dsuCompletion}%`}
            subtitle="Today"
            icon={CheckCircle}
            iconClassName={dsuCompletion < 80 ? 'bg-warning/10' : undefined}
          />
        </div>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Intern Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { status: 'Onboarding', count: mockInterns.filter((i) => i.status === 'onboarding').length, color: 'bg-warning' },
                { status: 'Training', count: trainingInterns, color: 'bg-info' },
                { status: 'Active', count: activeInterns, color: 'bg-success' },
                { status: 'Completed', count: mockInterns.filter((i) => i.status === 'completed').length, color: 'bg-muted-foreground' },
                { status: 'Dropped', count: mockInterns.filter((i) => i.status === 'dropped').length, color: 'bg-error' },
              ].map((item) => (
                <div
                  key={item.status}
                  className="flex items-center gap-3 rounded-lg border p-4"
                >
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{item.count}</p>
                    <p className="text-sm text-muted-foreground">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* DSU Board Preview */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-accent" />
                Today's DSU Status
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/dsu-board">
                  View Board
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-success-light p-3">
                  <p className="text-2xl font-bold text-success">{submittedDSUs}</p>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                </div>
                <div className="rounded-lg bg-warning-light p-3">
                  <p className="text-2xl font-bold text-warning">
                    {activeInterns - submittedDSUs}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="rounded-lg bg-error-light p-3">
                  <p className="text-2xl font-bold text-error">{blockedInterns.length}</p>
                  <p className="text-xs text-muted-foreground">Blocked</p>
                </div>
              </div>

              {blockedInterns.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Interns with Blockers
                  </p>
                  <div className="space-y-2">
                    {blockedInterns.slice(0, 2).map((dsu) => {
                      const intern = mockInterns.find((i) => i.id === dsu.internId);
                      return (
                        <div
                          key={dsu.id}
                          className="flex items-start gap-3 rounded-lg bg-warning-light/50 p-3 text-sm"
                        >
                          <Avatar name={intern?.name || ''} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{intern?.name}</p>
                            <p className="text-muted-foreground truncate">
                              {dsu.blockers}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-accent" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                      {activity.action.includes('DSU') ? (
                        <Calendar className="h-5 w-5 text-accent" />
                      ) : activity.action.includes('Task') ? (
                        <CheckCircle className="h-5 w-5 text-accent" />
                      ) : activity.action.includes('Intern') ? (
                        <Users className="h-5 w-5 text-accent" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        by {activity.user}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Interns */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Interns</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/interns">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Intern
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Mentor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockInterns.slice(0, 5).map((intern) => (
                    <tr key={intern.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={intern.name} size="sm" />
                          <div>
                            <p className="font-medium">{intern.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {intern.domain}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm uppercase font-medium">
                          {intern.internType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{intern.currentProject}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={intern.status} />
                      </td>
                      <td className="px-4 py-3 text-sm">{intern.mentor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
