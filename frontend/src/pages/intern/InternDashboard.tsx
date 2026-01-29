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
  Umbrella,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { taskService } from '@/services/taskService';
import { dsuService } from '@/services/dsuService';
import { ptoService } from '@/services/ptoService';
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
  
  const [ptoForm, setPtoForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPTOSubmitting, setIsPTOSubmitting] = useState(false);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  
  const today = new Date().toISOString().split('T')[0];

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
      fetchData();
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

  const handlePTOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ptoForm.startDate || !ptoForm.endDate) {
      toast({
        title: 'Missing dates',
        description: 'Please select start and end dates',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(ptoForm.endDate) < new Date(ptoForm.startDate)) {
      toast({
        title: 'Invalid dates',
        description: 'End date must be after start date',
        variant: 'destructive',
      });
      return;
    }

    setIsPTOSubmitting(true);
    
    try {
      const numberOfDays = Math.ceil(
        (new Date(ptoForm.endDate).getTime() - new Date(ptoForm.startDate).getTime()) 
        / (1000 * 60 * 60 * 24)
      ) + 1;

      await ptoService.create({
        internId: user?.id || '',
        name: user?.name || '',
        email: user?.email || '',
        team: 'Engineering',
        startDate: ptoForm.startDate,
        endDate: ptoForm.endDate,
        numberOfDays,
        reason: ptoForm.reason,
      });
      
      toast({
        title: 'PTO Request Submitted!',
        description: `Your leave request for ${numberOfDays} day(s) has been submitted for approval.`,
      });
      
      setPtoForm({ startDate: '', endDate: '', reason: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to submit PTO request',
        variant: 'destructive',
      });
    } finally {
      setIsPTOSubmitting(false);
    }
  };

  const activeTasks = tasks.filter((t) => t.status !== 'DONE' && t.status !== 'completed').slice(0, 3);
  const completedTasks = tasks.filter((t) => t.status === 'DONE' || t.status === 'completed').length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section - Purple Gradient with Pink Glow */}
        <div className="relative overflow-hidden rounded-2xl hero-gradient p-6 md:p-8 shadow-purple">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          {/* Pink radial glow overlay */}
          <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
          
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-white">
              <div className="flex items-center gap-2 text-white/90 mb-2">
                <Sun className="h-5 w-5 text-accent-500 animate-pulse-glow" />
                <span className="text-sm font-medium text-accent-500">{greeting}</span>
              </div>
              <h1 className="text-3xl font-bold md:text-4xl mb-2">
                {user?.name?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-lg text-white/90">
                {todaysDSU
                  ? "You've submitted today's standup. Keep up the great work!"
                  : "Ready to share your daily update?"}
              </p>
            </div>
            
            {!todaysDSU && (
              <Button 
                variant="default" 
                size="lg"
                className="w-fit bg-accent-500 hover:bg-accent-600 text-white font-semibold shadow-pink transition-all hover:scale-105"
                asChild
              >
                <a href="#dsu-form">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Submit DSU
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid with staggered animation */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <StatCard
              title="Active Tasks"
              value={activeTasks.length}
              subtitle="In progress"
              icon={Clock}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <StatCard
              title="Completed"
              value={completedTasks}
              subtitle="This month"
              icon={CheckCircle}
              trend={{ value: 12, isPositive: true }}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <StatCard
              title="DSU Streak"
              value="7 days"
              subtitle="Keep it going!"
              icon={TrendingUp}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <StatCard
              title="Days Remaining"
              value="45"
              subtitle="Internship period"
              icon={Calendar}
            />
          </div>
        </div>

        {/* 3 Column Grid - DSU, Tasks, PTO */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* DSU Form */}
          <Card id="dsu-form" className="overflow-hidden border-2 hover:border-primary-500 transition-all card-hover">
            <CardHeader className="border-b bg-gradient-card">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-primary-500/10">
                  <Calendar className="h-5 w-5 text-primary-500" />
                </div>
                <span>Daily Standup</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {todaysDSU ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Submitted Today!</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="font-semibold text-primary-500 mb-1">Yesterday</p>
                      <p className="line-clamp-2 text-muted-foreground">{todaysDSU.yesterday}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="font-semibold text-primary-500 mb-1">Today</p>
                      <p className="line-clamp-2 text-muted-foreground">{todaysDSU.today}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDSUSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Yesterday</label>
                    <Textarea
                      value={dsuForm.yesterday}
                      onChange={(e) => setDsuForm({ ...dsuForm, yesterday: e.target.value })}
                      placeholder="What you worked on..."
                      required
                      rows={2}
                      className="resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Today</label>
                    <Textarea
                      value={dsuForm.today}
                      onChange={(e) => setDsuForm({ ...dsuForm, today: e.target.value })}
                      placeholder="What you'll work on..."
                      required
                      rows={2}
                      className="resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Blockers</label>
                    <Textarea
                      value={dsuForm.blockers}
                      onChange={(e) => setDsuForm({ ...dsuForm, blockers: e.target.value })}
                      placeholder="Any blockers..."
                      rows={2}
                      className="resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary text-white font-semibold shadow-primary hover:shadow-purple transition-all hover:scale-[1.02]" 
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Standup'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Active Tasks */}
          <Card className="border-2 hover:border-primary-500 transition-all card-hover">
            <CardHeader className="border-b bg-gradient-card flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-primary-500/10">
                  <Clock className="h-5 w-5 text-primary-500" />
                </div>
                <span>Active Tasks</span>
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-600" asChild>
                <Link to="/daily-updates">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {activeTasks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No active tasks</p>
                </div>
              ) : (
                <div className="divide-y">
                  {activeTasks.map((task, index) => (
                    <div 
                      key={task._id} 
                      className="flex items-start gap-4 p-4 hover:bg-gradient-card transition-all cursor-pointer group"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate group-hover:text-primary-500 transition-colors">{task.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{task.project}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* PTO Request Form */}
          <Card className="overflow-hidden border-2 hover:border-accent-500 transition-all card-hover">
            <CardHeader className="border-b bg-gradient-to-br from-accent-500/5 to-primary-500/5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-accent-500/10">
                  <Umbrella className="h-5 w-5 text-accent-500" />
                </div>
                <span>Request Time Off</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePTOSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={ptoForm.startDate}
                    onChange={(e) => setPtoForm({ ...ptoForm, startDate: e.target.value })}
                    min={today}
                    required
                    className="focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">End Date</label>
                  <Input
                    type="date"
                    value={ptoForm.endDate}
                    onChange={(e) => setPtoForm({ ...ptoForm, endDate: e.target.value })}
                    min={ptoForm.startDate || today}
                    required
                    className="focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>

                {ptoForm.startDate && ptoForm.endDate && (
                  <div className="bg-gradient-to-br from-accent-500/10 to-primary-500/10 p-4 rounded-xl text-center border border-accent-500/20 animate-scale-in">
                    <p className="text-sm text-muted-foreground mb-1">Total Days</p>
                    <p className="text-3xl font-bold text-gradient-purple">
                      {Math.ceil(
                        (new Date(ptoForm.endDate).getTime() - new Date(ptoForm.startDate).getTime()) 
                        / (1000 * 60 * 60 * 24)
                      ) + 1}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Reason (Optional)</label>
                  <Textarea
                    value={ptoForm.reason}
                    onChange={(e) => setPtoForm({ ...ptoForm, reason: e.target.value })}
                    placeholder="Brief reason for leave..."
                    rows={2}
                    className="resize-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold shadow-pink transition-all hover:scale-[1.02]" 
                  disabled={isPTOSubmitting}
                  size="lg"
                >
                  {isPTOSubmitting ? 'Submitting...' : 'Request Time Off'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-2 hover:border-primary-500 transition-all">
          <CardHeader>
            <CardTitle className="text-lg">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="justify-start h-auto py-4 border-2 hover:border-primary-500 hover:bg-gradient-card transition-all group" asChild>
                <Link to="/daily-updates">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-white group-hover:scale-110 transition-transform">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Add Task</p>
                      <p className="text-xs text-muted-foreground">Log new work item</p>
                    </div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4 border-2 hover:border-primary-500 hover:bg-gradient-card transition-all group" asChild>
                <Link to="/dashboard/profile">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-white group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">View Progress</p>
                      <p className="text-xs text-muted-foreground">Track your growth</p>
                    </div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4 border-2 hover:border-primary-500 hover:bg-gradient-card transition-all group" asChild>
                <Link to="/daily-updates">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-white group-hover:scale-110 transition-transform">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Daily Updates</p>
                      <p className="text-xs text-muted-foreground">Track today's work</p>
                    </div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4 border-2 hover:border-primary-500 hover:bg-gradient-card transition-all group" asChild>
                <Link to="/dashboard/profile">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-white group-hover:scale-110 transition-transform">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">View Profile</p>
                      <p className="text-xs text-muted-foreground">Check details</p>
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