import React, { useState, useEffect } from 'react';
import {
  Sun,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { taskService } from '@/services/taskService';
import { dsuService } from '@/services/dsuService';
import { Task } from '@/types/intern';

const InternDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todaysDSU, setTodaysDSU] = useState<any>(null);
  
  const [dsuForm, setDsuForm] = useState({
    yesterday: '',
    today: '',
    blockers: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  
  const today = new Date().toISOString().split('T')[0];

  // ✅ Fetch real data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, dsuData] = await Promise.all([
        taskService.getAll(user?.id),
        dsuService.getByDate(user?.id || '', today),
      ]);
      
      setTasks(tasksData);
      setTodaysDSU(dsuData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDSUSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dsuForm.yesterday || !dsuForm.today) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in yesterday and today fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await dsuService.create({
        internId: user?.id || '',
        date: today,
        ...dsuForm,
      });
      
      toast({
        title: 'DSU Submitted!',
        description: 'Your daily standup has been recorded.',
      });
      
      setDsuForm({ yesterday: '', today: '', blockers: '' });
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit DSU',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Calculate stats from real data
  const activeTasks = tasks.filter((t) => t.status !== 'DONE' && t.status !== 'completed').slice(0, 3);
  const completedTasks = tasks.filter((t) => t.status === 'DONE' || t.status === 'completed').length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl hero-gradient p-6 md:p-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-white">
              <div className="flex items-center gap-2 text-white/80 mb-1">
                <Sun className="h-5 w-5" />
                <span className="text-sm font-medium">{greeting}</span>
              </div>
              <h1 className="text-2xl font-bold md:text-3xl">
                {user?.name?.split(' ')[0] || 'there'}!
              </h1>
              <p className="mt-1 text-white/80">
                {todaysDSU
                  ? "You've submitted today's standup. Keep up the great work!"
                  : "Ready to share your daily update?"}
              </p>
            </div>
            
            {!todaysDSU && (
              <Button variant="hero" className="w-fit" asChild>
                <a href="#dsu-form">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Submit DSU
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Tasks"
            value={activeTasks.length}
            subtitle="In progress"
            icon={Clock}
          />
          <StatCard
            title="Completed"
            value={completedTasks}
            subtitle="This month"
            icon={CheckCircle}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="DSU Streak"
            value="7 days"
            subtitle="Keep it going!"
            icon={TrendingUp}
          />
          <StatCard
            title="Days Remaining"
            value="45"
            subtitle="Internship period"
            icon={Calendar}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* DSU Form */}
          <Card id="dsu-form" className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-accent" />
                Daily Standup Update
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {todaysDSU ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Submitted for today</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Yesterday</p>
                      <p>{todaysDSU.yesterday}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Today</p>
                      <p>{todaysDSU.today}</p>
                    </div>
                    {todaysDSU.blockers && (
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Blockers</p>
                        <p className="text-warning">{todaysDSU.blockers}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDSUSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      What did you work on yesterday?
                    </label>
                    <Textarea
                      value={dsuForm.yesterday}
                      onChange={(e) =>
                        setDsuForm({ ...dsuForm, yesterday: e.target.value })
                      }
                      placeholder="Completed the product listing page..."
                      required
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      What will you work on today?
                    </label>
                    <Textarea
                      value={dsuForm.today}
                      onChange={(e) =>
                        setDsuForm({ ...dsuForm, today: e.target.value })
                      }
                      placeholder="Working on cart functionality..."
                      required
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Any blockers?
                    </label>
                    <Textarea
                      value={dsuForm.blockers}
                      onChange={(e) =>
                        setDsuForm({ ...dsuForm, blockers: e.target.value })
                      }
                      placeholder="No blockers / Waiting for API docs..."
                      rows={2}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="accent"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Daily Update'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Active Tasks */}
          <Card>
            <CardHeader className="border-b bg-muted/30 flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-accent" />
                Active Tasks
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/daily-updates">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {activeTasks.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No active tasks. Great job!
                </div>
              ) : (
                <div className="divide-y">
                  {activeTasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{task.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {task.project}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/daily-updates">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <CheckCircle className="h-5 w-5 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Add Task</p>
                      <p className="text-xs text-muted-foreground">
                        Log new work item
                      </p>
                    </div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/dashboard/profile">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">View Progress</p>
                      <p className="text-xs text-muted-foreground">
                        Track your growth
                      </p>
                    </div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/daily-updates">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Calendar className="h-5 w-5 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Daily Updates</p>
                      <p className="text-xs text-muted-foreground">
                        Track today's work
                      </p>
                    </div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/dashboard/profile">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <AlertTriangle className="h-5 w-5 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">View Profile</p>
                      <p className="text-xs text-muted-foreground">
                        Check details
                      </p>
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternDashboard;
