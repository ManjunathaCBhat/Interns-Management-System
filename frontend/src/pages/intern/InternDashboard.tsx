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
  Umbrella, // ✅ NEW: For PTO icon
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; // ✅ NEW
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { taskService } from '@/services/taskService';
import { dsuService } from '@/services/dsuService';
import { ptoService } from '@/services/ptoService'; // ✅ NEW
import { internService } from '@/services/internService'; // ✅ NEW
import { Task } from '@/types/intern';

const InternDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todaysDSU, setTodaysDSU] = useState<any>(null);
  const [internData, setInternData] = useState<any>(null); // ✅ NEW: Store intern details
  
  const [dsuForm, setDsuForm] = useState({
    yesterday: '',
    today: '',
    blockers: '',
  });
  
  // ✅ NEW: PTO Form State
  const [ptoForm, setPtoForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPTOSubmitting, setIsPTOSubmitting] = useState(false); // ✅ NEW

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  
  const today = new Date().toISOString().split('T')[0];

  // ✅ NEW: Calculate days remaining
  const calculateDaysRemaining = (joinedDate: string) => {
    const joined = new Date(joinedDate);
    const internshipLength = 90; // 3 months in days
    const endDate = new Date(joined.getTime() + internshipLength * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, dsuData, internDetail] = await Promise.all([
        taskService.getAll(user?.id),
        dsuService.getByDate(user?.id || '', today),
        internService.getById(user?.id || ''), // ✅ NEW: Fetch intern details
      ]);
      
      setTasks(tasksData);
      setTodaysDSU(dsuData);
      setInternData(internDetail); // ✅ NEW
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

  // ✅ NEW: PTO Submit Handler
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
            value={`${internData?.dsuStreak || 0} days`}
            subtitle="Keep it going!"
            icon={TrendingUp}
          />
          <StatCard
            title="Days Remaining"
            value={`${calculateDaysRemaining(internData?.joinedDate || new Date().toISOString())}`}
            subtitle="Internship period"
            icon={Calendar}
          />
        </div>

        {/* ✅ NEW: 3 Column Grid - DSU, Tasks, PTO */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* DSU Form */}
          <Card id="dsu-form" className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-accent" />
                Daily Standup
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {todaysDSU ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Submitted</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Yesterday</p>
                      <p className="line-clamp-2">{todaysDSU.yesterday}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Today</p>
                      <p className="line-clamp-2">{todaysDSU.today}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDSUSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Yesterday</label>
                    <Textarea
                      value={dsuForm.yesterday}
                      onChange={(e) => setDsuForm({ ...dsuForm, yesterday: e.target.value })}
                      placeholder="What you worked on..."
                      required
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Today</label>
                    <Textarea
                      value={dsuForm.today}
                      onChange={(e) => setDsuForm({ ...dsuForm, today: e.target.value })}
                      placeholder="What you'll work on..."
                      required
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Blockers</label>
                    <Textarea
                      value={dsuForm.blockers}
                      onChange={(e) => setDsuForm({ ...dsuForm, blockers: e.target.value })}
                      placeholder="Any blockers..."
                      rows={2}
                    />
                  </div>
                  <Button type="submit" variant="accent" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
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
                <Link to="/daily-updates">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {activeTasks.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No active tasks
                </div>
              ) : (
                <div className="divide-y">
                  {activeTasks.map((task) => (
                    <div key={task._id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{task.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{task.project}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ✅ NEW: PTO Request Form */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Umbrella className="h-5 w-5 text-accent" />
                Request Time Off
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePTOSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={ptoForm.startDate}
                    onChange={(e) => setPtoForm({ ...ptoForm, startDate: e.target.value })}
                    min={today}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={ptoForm.endDate}
                    onChange={(e) => setPtoForm({ ...ptoForm, endDate: e.target.value })}
                    min={ptoForm.startDate || today}
                    required
                  />
                </div>

                {ptoForm.startDate && ptoForm.endDate && (
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total Days</p>
                    <p className="text-2xl font-bold">
                      {Math.ceil(
                        (new Date(ptoForm.endDate).getTime() - new Date(ptoForm.startDate).getTime()) 
                        / (1000 * 60 * 60 * 24)
                      ) + 1}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason (Optional)</label>
                  <Textarea
                    value={ptoForm.reason}
                    onChange={(e) => setPtoForm({ ...ptoForm, reason: e.target.value })}
                    placeholder="Brief reason for leave..."
                    rows={2}
                  />
                </div>
                
                <Button type="submit" variant="accent" className="w-full" disabled={isPTOSubmitting}>
                  {isPTOSubmitting ? 'Submitting...' : 'Request PTO'}
                </Button>
              </form>
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
                      <p className="text-xs text-muted-foreground">Log new work item</p>
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
                      <p className="text-xs text-muted-foreground">Track your growth</p>
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
                      <p className="text-xs text-muted-foreground">Track today's work</p>
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
