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
  Loader2,
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
import { feedbackService } from '@/services/feedbackService';
import { Skeleton } from '@/components/ui/skeleton';

const InternDashboard: React.FC = () => {
    // Feedback form handler
    const handleFeedbackSubmit = async (data: { name: string; email: string; message: string }) => {
      try {
        await feedbackService.sendFeedback({ ...data, role: user?.role || 'intern' });
        toast({ title: 'Feedback sent!', description: 'Thank you for your feedback.' });
      } catch (error: any) {
        toast({ title: 'Failed to send feedback', description: error?.response?.data?.detail || 'Please try again later', variant: 'destructive' });
      }
    };
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
  // const calculateDaysRemaining = (joinedDate: string) => {
  //   const joined = new Date(joinedDate);
  //   const internshipLength = 90; // 3 months in days
  //   const endDate = new Date(joined.getTime() + internshipLength * 24 * 60 * 60 * 1000);
  //   const now = new Date();
  //   const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  //   return Math.max(0, daysRemaining);
  // };

  const calculateDaysRemaining = (endDate: string | null | undefined): string => {
  if (!endDate) return 'Not Available';
  const end = new Date(endDate);
  const now = new Date();
  const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return String(Math.max(0, daysRemaining));
};

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, dsuData, internDetail] = await Promise.all([
        taskService.getAll({ intern_id: user?.id }),
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

  // Use backend-calculated metrics
  const activeTasks = tasks.filter((t) => t.status !== 'DONE' && t.status !== 'completed').slice(0, 3);
  const activeTasksCount = (internData?.taskCount || 0) - (internData?.completedTasks || 0);
  const completedTasksCount = internData?.completedTasks || 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Hero Section Skeleton */}
          <Skeleton className="h-32 w-full rounded-2xl" />

          {/* Stats Grid Skeleton */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>

          {/* 3 Column Grid Skeleton */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>

          {/* Quick Actions Skeleton */}
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Hero Section - Blue Eclipse Theme */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0F0E47] to-[#272757] p-5 md:p-6 shadow-lg">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

          {/* Glow Effects */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#8686AC] rounded-full opacity-10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#505081] rounded-full opacity-10 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-white space-y-1.5">
              <div className="flex items-center gap-2 text-white/90">
                <Sun className="h-4 w-4" />
                <span className="text-xs font-medium tracking-wide">{greeting}</span>
              </div>
              <h1 className="text-2xl font-bold md:text-2xl">
                Welcome, {user?.name?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-white/80 text-sm max-w-xl">
                {todaysDSU
                  ? "You've submitted today's standup. Keep up the great work!"
                  : "Ready to share your daily update?"}
              </p>
            </div>

            {!todaysDSU && (
              <a href="#dsu-form">
                <button className="group relative px-5 py-2.5 bg-white text-[#0F0E47] rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4" />
                    Submit DSU
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8686AC] to-[#505081] opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>
              </a>
            )}
          </div>
        </div>

        {/* Interactive KPI Cards - Blue Eclipse Theme */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Active Tasks Card */}
          <Link to="/intern/daily-updates">
            <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.05] hover:border-[#8686AC]/30 cursor-pointer active:scale-[0.98]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8686AC]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#505081]/5 rounded-full blur-2xl group-hover:bg-[#505081]/10 transition-all duration-500" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Clock className="h-8 w-8 text-[#505081] group-hover:scale-110 transition-transform duration-300 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-[#505081]">Active Tasks</p>
                    <p className="text-xs text-[#8686AC] mt-0.5">In progress</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-3xl font-bold text-[#0F0E47] group-hover:text-[#272757] transition-colors">{activeTasksCount}</p>
                  <ArrowRight className="h-4 w-4 text-[#8686AC] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 mt-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Completed Tasks Card */}
          <Link to="/intern/daily-updates">
            <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.05] hover:border-[#8686AC]/30 cursor-pointer active:scale-[0.98]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8686AC]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-all duration-500" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform duration-300 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-[#505081]">Completed</p>
                    <p className="text-xs text-[#8686AC] mt-0.5">This month</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-3xl font-bold text-[#0F0E47] group-hover:text-[#272757] transition-colors">{completedTasksCount}</p>
                  <ArrowRight className="h-4 w-4 text-[#8686AC] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 mt-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* DSU Streak Card */}
          <Link to="/intern/daily-updates">
            <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.05] hover:border-[#8686AC]/30 cursor-pointer active:scale-[0.98]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8686AC]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all duration-500" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-[#505081]">DSU Streak</p>
                    <p className="text-xs text-[#8686AC] mt-0.5">Keep it going!</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-3xl font-bold text-[#0F0E47] group-hover:text-[#272757] transition-colors">{internData?.dsuStreak || 0}</p>
                  <ArrowRight className="h-4 w-4 text-[#8686AC] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 mt-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Days Remaining Card */}
          <Link to="/intern/profile">
            <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.05] hover:border-[#8686AC]/30 cursor-pointer active:scale-[0.98]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8686AC]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-500" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Calendar className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform duration-300 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-[#505081]">Days Remaining</p>
                    <p className="text-xs text-[#8686AC] mt-0.5">Internship period</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-3xl font-bold text-[#0F0E47] group-hover:text-[#272757] transition-colors">
                    {/* {calculateDaysRemaining(internData?.joinedDate || new Date().toISOString())} */}

                    {calculateDaysRemaining(internData?.endDate)}
                  </p>
                  <ArrowRight className="h-4 w-4 text-[#8686AC] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 mt-1" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 3 Column Grid - DSU, Tasks, PTO - Blue Eclipse Theme */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Daily Standup Form */}
          <Card id="dsu-form" className="overflow-hidden border-2 border-gray-100 hover:border-[#8686AC]/30 transition-all duration-300 shadow-lg hover:shadow-2xl">
            <CardHeader className="border-b bg-gradient-to-r from-[#0F0E47]/5 to-[#272757]/5 backdrop-blur-sm">
              <CardTitle className="flex items-center gap-2 text-lg text-[#0F0E47]">
                <div className="p-2 rounded-lg bg-[#505081]/10">
                  <Calendar className="h-5 w-5 text-[#505081]" />
                </div>
                Daily Standup
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {todaysDSU ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Submitted</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-[#8686AC]/5 to-transparent border-l-4 border-[#505081]">
                      <p className="font-semibold text-[#0F0E47] mb-1.5">Yesterday</p>
                      <p className="text-[#505081] line-clamp-2">{todaysDSU.yesterday}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-[#8686AC]/5 to-transparent border-l-4 border-[#505081]">
                      <p className="font-semibold text-[#0F0E47] mb-1.5">Today</p>
                      <p className="text-[#505081] line-clamp-2">{todaysDSU.today}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDSUSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#0F0E47]">Yesterday *</label>
                    <Textarea
                      value={dsuForm.yesterday}
                      onChange={(e) => setDsuForm({ ...dsuForm, yesterday: e.target.value })}
                      placeholder="What you worked on..."
                      required
                      rows={2}
                      className="border-2 border-gray-200 focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#0F0E47]">Today *</label>
                    <Textarea
                      value={dsuForm.today}
                      onChange={(e) => setDsuForm({ ...dsuForm, today: e.target.value })}
                      placeholder="What you'll work on..."
                      required
                      rows={2}
                      className="border-2 border-gray-200 focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#0F0E47]">Blockers</label>
                    <Textarea
                      value={dsuForm.blockers}
                      onChange={(e) => setDsuForm({ ...dsuForm, blockers: e.target.value })}
                      placeholder="Any blockers..."
                      rows={2}
                      className="border-2 border-gray-200 focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 transition-all resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#0F0E47] to-[#272757] hover:from-[#272757] hover:to-[#505081] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit DSU'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Active Tasks */}
          <Card className="overflow-hidden border-2 border-gray-100 hover:border-[#8686AC]/30 transition-all duration-300 shadow-lg hover:shadow-2xl">
            <CardHeader className="border-b bg-gradient-to-r from-[#0F0E47]/5 to-[#272757]/5 backdrop-blur-sm flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg text-[#0F0E47]">
                <div className="p-2 rounded-lg bg-[#505081]/10">
                  <Clock className="h-5 w-5 text-[#505081]" />
                </div>
                Active Tasks
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#505081] hover:text-[#0F0E47] hover:bg-[#8686AC]/10 transition-all"
                asChild
              >
                <Link to="/daily-updates" className="flex items-center gap-1">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {activeTasks.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8686AC]/10 mb-3">
                    <CheckCircle className="h-8 w-8 text-[#8686AC]" />
                  </div>
                  <p className="text-[#505081] font-medium">No active tasks</p>
                  <p className="text-sm text-[#8686AC] mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activeTasks.map((task) => (
                    <div
                      key={task._id}
                      className="group flex items-start gap-4 p-4 hover:bg-gradient-to-r hover:from-[#8686AC]/5 hover:to-transparent transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#0F0E47] truncate group-hover:text-[#272757] transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-sm text-[#505081] truncate mt-0.5">{task.project}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* PTO Request Form */}
          <Card className="overflow-hidden border-2 border-gray-100 hover:border-[#8686AC]/30 transition-all duration-300 shadow-lg hover:shadow-2xl">
            <CardHeader className="border-b bg-gradient-to-r from-[#0F0E47]/5 to-[#272757]/5 backdrop-blur-sm">
              <CardTitle className="flex items-center gap-2 text-lg text-[#0F0E47]">
                <div className="p-2 rounded-lg bg-[#505081]/10">
                  <Umbrella className="h-5 w-5 text-[#505081]" />
                </div>
                Request Time Off
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePTOSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0F0E47]">Start Date *</label>
                  <Input
                    type="date"
                    value={ptoForm.startDate}
                    onChange={(e) => setPtoForm({ ...ptoForm, startDate: e.target.value })}
                    min={today}
                    required
                    className="border-2 border-gray-200 focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0F0E47]">End Date *</label>
                  <Input
                    type="date"
                    value={ptoForm.endDate}
                    onChange={(e) => setPtoForm({ ...ptoForm, endDate: e.target.value })}
                    min={ptoForm.startDate || today}
                    required
                    className="border-2 border-gray-200 focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 transition-all"
                  />
                </div>

                {ptoForm.startDate && ptoForm.endDate && (
                  <div className="bg-gradient-to-br from-[#8686AC]/10 to-[#505081]/5 p-4 rounded-xl text-center border-2 border-[#8686AC]/20 shadow-inner">
                    <p className="text-sm font-medium text-[#505081]">Total Days</p>
                    <p className="text-3xl font-bold text-[#0F0E47] mt-1">
                      {Math.ceil(
                        (new Date(ptoForm.endDate).getTime() - new Date(ptoForm.startDate).getTime())
                        / (1000 * 60 * 60 * 24)
                      ) + 1}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0F0E47]">Reason (Optional)</label>
                  <Textarea
                    value={ptoForm.reason}
                    onChange={(e) => setPtoForm({ ...ptoForm, reason: e.target.value })}
                    placeholder="Brief reason for leave..."
                    rows={2}
                    className="border-2 border-gray-200 focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 transition-all resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isPTOSubmitting}
                  className="w-full bg-gradient-to-r from-[#0F0E47] to-[#272757] hover:from-[#272757] hover:to-[#505081] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isPTOSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Umbrella className="mr-2 h-4 w-4" />
                      Request PTO
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default InternDashboard;