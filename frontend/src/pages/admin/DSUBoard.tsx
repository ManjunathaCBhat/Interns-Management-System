import React, { useState } from 'react';
import {
  Calendar,
  Filter,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  RefreshCw,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StatusBadge from '@/components/shared/StatusBadge';
import Avatar from '@/components/shared/Avatar';
import { mockInterns, mockDSUEntries, mockProjects } from '@/data/mockData';

const DSUBoard: React.FC = () => {
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const today = new Date().toISOString().split('T')[0];
  const activeInterns = mockInterns.filter((i) => i.status === 'active' || i.status === 'training');

  const getDSUForIntern = (internId: string) => {
    return mockDSUEntries.find(
      (dsu) => dsu.internId === internId && dsu.date === today
    );
  };

  const getStatusIndicator = (dsu: typeof mockDSUEntries[0] | undefined) => {
    if (!dsu || dsu.status === 'pending') {
      return { color: 'bg-warning', label: 'Pending' };
    }
    if (dsu.blockers && dsu.blockers.length > 0) {
      return { color: 'bg-error', label: 'Blocked' };
    }
    return { color: 'bg-success', label: 'Submitted' };
  };

  const filteredInterns = activeInterns.filter((intern) => {
    const dsu = getDSUForIntern(intern.id);
    const status = getStatusIndicator(dsu);

    const matchesProject =
      projectFilter === 'all' || intern.projectId === projectFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'submitted' && status.label === 'Submitted') ||
      (statusFilter === 'pending' && status.label === 'Pending') ||
      (statusFilter === 'blocked' && status.label === 'Blocked');

    return matchesProject && matchesStatus;
  });

  const stats = {
    submitted: activeInterns.filter((i) => {
      const dsu = getDSUForIntern(i.id);
      return dsu && dsu.status === 'submitted' && (!dsu.blockers || dsu.blockers.length === 0);
    }).length,
    pending: activeInterns.filter((i) => {
      const dsu = getDSUForIntern(i.id);
      return !dsu || dsu.status === 'pending';
    }).length,
    blocked: activeInterns.filter((i) => {
      const dsu = getDSUForIntern(i.id);
      return dsu && dsu.blockers && dsu.blockers.length > 0;
    }).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              DSU Board
            </h1>
            <p className="text-muted-foreground">
              Daily Standup Updates for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-l-4 border-l-success">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.submitted}</p>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-error">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error/10">
                  <AlertTriangle className="h-6 w-6 text-error" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.blocked}</p>
                  <p className="text-sm text-muted-foreground">Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {mockProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* DSU Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredInterns.map((intern) => {
            const dsu = getDSUForIntern(intern.id);
            const status = getStatusIndicator(dsu);

            return (
              <Card key={intern.id} className="overflow-hidden">
                <CardHeader className="border-b bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={intern.name} size="md" />
                      <div>
                        <p className="font-medium">{intern.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {intern.currentProject}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-full ${status.color}`}
                        title={status.label}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {dsu && dsu.status === 'submitted' ? (
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">
                          Yesterday
                        </p>
                        <p className="line-clamp-2">{dsu.yesterday}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">
                          Today
                        </p>
                        <p className="line-clamp-2">{dsu.today}</p>
                      </div>
                      {dsu.blockers && (
                        <div className="rounded-lg bg-error/10 p-2">
                          <p className="font-medium text-error mb-1 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            Blocker
                          </p>
                          <p className="text-error/80">{dsu.blockers}</p>
                        </div>
                      )}
                      {dsu.mentorComment && (
                        <div className="rounded-lg bg-accent/10 p-2 mt-2">
                          <p className="font-medium text-accent mb-1 flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            Mentor Feedback
                          </p>
                          <p className="text-muted-foreground">
                            {dsu.mentorComment}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Clock className="h-10 w-10 text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">
                        No DSU submitted yet
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Send Reminder
                      </Button>
                    </div>
                  )}
                </CardContent>
                {dsu && dsu.status === 'submitted' && (
                  <div className="border-t p-3 bg-muted/20">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageSquare className="mr-1 h-4 w-4" />
                        Comment
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {filteredInterns.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No interns found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DSUBoard;
