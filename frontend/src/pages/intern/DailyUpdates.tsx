import React, { useState, useEffect } from 'react';
import { Plus, Save, Calendar, TrendingUp, CheckCircle, Clock, Sparkles, Sun } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { taskService } from '@/services/taskService';
import { dsuService } from '@/services/dsuService';
import { projectService } from '@/services/projectService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Task, Project } from '@/types/intern';

const STATUS_OPTIONS = [
  { value: 'NOT_STARTED', label: 'Not Started', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400' },
  { value: 'BLOCKED', label: 'Blocked', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'DONE', label: 'Done', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
];

export default function DailyUpdates() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSubmittedDSU, setHasSubmittedDSU] = useState(false);
  
  const [dsuData, setDsuData] = useState({
    yesterday: '',
    today: '',
    blockers: '',
    learnings: '',
  });
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project: '',
    status: 'NOT_STARTED',
    comments: '',
  });

  const today = new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData, dsuData] = await Promise.all([
        taskService.getAll(user?.id),
        projectService.getAll(),
        dsuService.getByDate(user?.id || '', today),
      ]);
      
      // Filter tasks for today
      const todayTasks = tasksData.filter((t: Task) => {
        const taskDate = t.date || t.task_date || '';
        return taskDate === today;
      });
      
      setTasks(todayTasks);
      setProjects(projectsData);
      
      // Check if DSU already submitted
      if (dsuData) {
        setHasSubmittedDSU(true);
        setDsuData({
          yesterday: dsuData.yesterday || '',
          today: dsuData.today || '',
          blockers: dsuData.blockers || '',
          learnings: dsuData.learnings || '',
        });
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDSU = async () => {
    if (!dsuData.yesterday || !dsuData.today) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in yesterday and today fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await dsuService.create({
        internId: user?.id || '',
        date: today,
        ...dsuData,
      });
      
      setHasSubmittedDSU(true);
      toast({
        title: 'DSU Submitted!',
        description: 'Daily standup submitted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to submit DSU',
        variant: 'destructive',
      });
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.project) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in task title and project',
        variant: 'destructive',
      });
      return;
    }

    try {
      const taskData = {
        ...newTask,
        internId: user?.id || '',
        date: today,
      };
      
      const created = await taskService.create(taskData);
      setTasks([...tasks, created]);
      setNewTask({
        title: '',
        description: '',
        project: '',
        status: 'NOT_STARTED',
        comments: '',
      });
      
      toast({
        title: 'Task Added!',
        description: 'Task added successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to add task',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updated = await taskService.update(id, updates);
      setTasks(tasks.map(t => t._id === id ? updated : t));
      
      toast({
        title: 'Task Updated!',
        description: 'Task updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'DONE').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
  };

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
        {/* Header with Welcome Message - Purple Gradient with Pink Glow */}
        <div className="relative overflow-hidden rounded-2xl hero-gradient p-6 md:p-8 shadow-purple">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          {/* Pink radial glow overlay */}
          <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
          
          <div className="relative text-white">
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <Sun className="h-5 w-5 text-accent-500 animate-pulse-glow" />
              <span className="text-lg font-medium text-accent-500">{greeting}</span>
            </div>
            <h1 className="text-3xl font-bold md:text-4xl mb-2">
              {user?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-lg text-white/90">
              {hasSubmittedDSU 
                ? "You've submitted today's standup. Keep up the great work!"
                : "Let's track your progress for today"}
            </p>
          </div>
        </div>

        {/* Stats Cards with staggered animation */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 hover:border-primary-500 transition-all card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500 text-white">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground font-medium">Active Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary-500 transition-all card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500 text-white">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground font-medium">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary-500 transition-all card-hover animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500 text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground font-medium">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent-500 transition-all card-hover animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500 text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">7 days</p>
                  <p className="text-sm text-muted-foreground font-medium">DSU Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Standup Update Section */}
        <Card className="border-2 hover:border-primary-500 transition-all">
          <CardHeader className="border-b bg-gradient-card">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Calendar className="h-5 w-5 text-primary-500" />
              </div>
              <span>Daily Standup Update</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {hasSubmittedDSU ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Submitted for today!</span>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-gradient-card border border-primary-500/20">
                    <p className="font-semibold text-primary-500 mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Yesterday
                    </p>
                    <p className="text-foreground">{dsuData.yesterday}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-card border border-primary-500/20">
                    <p className="font-semibold text-primary-500 mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Today
                    </p>
                    <p className="text-foreground">{dsuData.today}</p>
                  </div>
                  {dsuData.blockers && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                      <p className="font-semibold text-red-600 dark:text-red-400 mb-2">⚠️ Blockers</p>
                      <p className="text-red-900 dark:text-red-300">{dsuData.blockers}</p>
                    </div>
                  )}
                  {dsuData.learnings && (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-accent-500/10 to-primary-500/10 border border-accent-500/20">
                      <p className="font-semibold text-accent-500 mb-2">💡 Learnings</p>
                      <p className="text-foreground">{dsuData.learnings}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Yesterday *</label>
                  <Textarea
                    placeholder="What did you accomplish yesterday?"
                    value={dsuData.yesterday}
                    onChange={(e) => setDsuData({ ...dsuData, yesterday: e.target.value })}
                    rows={2}
                    className="resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Today *</label>
                  <Textarea
                    placeholder="What are you working on today?"
                    value={dsuData.today}
                    onChange={(e) => setDsuData({ ...dsuData, today: e.target.value })}
                    rows={2}
                    className="resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Blockers (Optional)</label>
                  <Textarea
                    placeholder="Any obstacles or challenges?"
                    value={dsuData.blockers}
                    onChange={(e) => setDsuData({ ...dsuData, blockers: e.target.value })}
                    rows={2}
                    className="resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Learnings (Optional)</label>
                  <Textarea
                    placeholder="What did you learn?"
                    value={dsuData.learnings}
                    onChange={(e) => setDsuData({ ...dsuData, learnings: e.target.value })}
                    rows={2}
                    className="resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <Button 
                  onClick={handleSubmitDSU} 
                  size="lg"
                  className="w-full bg-gradient-primary text-white font-semibold shadow-primary hover:shadow-purple transition-all hover:scale-[1.02]"
                >
                  <Save className="mr-2 h-5 w-5" />
                  Submit Standup
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Task Section */}
        <Card className="border-2 hover:border-accent-500 transition-all">
          <CardHeader className="border-b bg-gradient-to-br from-accent-500/5 to-primary-500/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-accent-500/10">
                <Plus className="h-5 w-5 text-accent-500" />
              </div>
              <span>Add New Task</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Task Title *</label>
                <Input
                  placeholder="What are you working on?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Project *</label>
                <Select
                  value={newTask.project}
                  onValueChange={(value) => setNewTask({ ...newTask, project: value })}
                >
                  <SelectTrigger className="focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project._id} value={project.name}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Status</label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) => setNewTask({ ...newTask, status: value })}
                >
                  <SelectTrigger className="focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-foreground">Description (Optional)</label>
                <Textarea
                  placeholder="Details about the task..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={2}
                  className="resize-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Comments</label>
                <Textarea
                  placeholder="Any notes or updates..."
                  value={newTask.comments}
                  onChange={(e) => setNewTask({ ...newTask, comments: e.target.value })}
                  rows={2}
                  className="resize-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                />
              </div>
            </div>

            <div className="mt-6">
              <Button 
                onClick={handleAddTask} 
                size="lg"
                className="w-full md:w-auto bg-accent-500 hover:bg-accent-600 text-white font-semibold shadow-pink transition-all hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Tasks */}
        <Card className="border-2 hover:border-primary-500 transition-all">
          <CardHeader className="border-b bg-gradient-card">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Clock className="h-5 w-5 text-primary-500" />
              </div>
              <span>Today's Tasks</span>
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {tasks.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No tasks yet</p>
                <p className="text-sm text-muted-foreground">Add your first task above to get started!</p>
              </div>
            ) : (
              <div className="divide-y">
                {tasks.map((task, index) => (
                  <div 
                    key={task._id} 
                    className="p-5 hover:bg-gradient-card transition-all group animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-500 transition-colors">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                          <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 font-medium">
                            {task.project}
                          </span>
                          {task.comments && (
                            <span className="text-muted-foreground">💬 {task.comments}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleUpdateTask(task._id, { status: value })}
                        >
                          <SelectTrigger className="w-[150px] border-2 hover:border-primary-500 transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${option.color}`}>
                                  {option.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}