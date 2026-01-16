import React, { useState, useEffect } from 'react';
import { Plus, Save, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';
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
  { value: 'NOT_STARTED', label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'BLOCKED', label: 'Blocked', color: 'bg-red-100 text-red-800' },
  { value: 'DONE', label: 'Done', color: 'bg-green-100 text-green-800' },
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
    
    // ✅ FIX: Safely filter tasks for today
    const todayTasks = tasksData.filter((t: Task) => {
      // Handle both 'date' and 'task_date' field names from backend
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
        title: 'Success',
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
        title: 'Success',
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
        title: 'Success',
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Welcome Message */}
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">☀️</span>
            <span className="text-lg font-medium">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{user?.name}!</h1>
          <p className="text-blue-100">
            {hasSubmittedDSU 
              ? "You've submitted today's standup. Keep up the great work!"
              : "Let's track your progress for today"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Active Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
                  <TrendingUp className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">7 days</p>
                  <p className="text-xs text-muted-foreground">DSU Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Standup Update Section */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-600" />
              Daily Standup Update
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {hasSubmittedDSU ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Submitted for today</span>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Yesterday</p>
                    <p>{dsuData.yesterday}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Today</p>
                    <p>{dsuData.today}</p>
                  </div>
                  {dsuData.blockers && (
                    <div className="rounded-lg bg-red-50 p-3">
                      <p className="font-medium text-red-600 mb-1">Blockers</p>
                      <p className="text-red-900/80">{dsuData.blockers}</p>
                    </div>
                  )}
                  {dsuData.learnings && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Learnings</p>
                      <p>{dsuData.learnings}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Yesterday</label>
                  <Textarea
                    placeholder="What did you accomplish yesterday?"
                    value={dsuData.yesterday}
                    onChange={(e) => setDsuData({ ...dsuData, yesterday: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Today</label>
                  <Textarea
                    placeholder="What are you working on today?"
                    value={dsuData.today}
                    onChange={(e) => setDsuData({ ...dsuData, today: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Blockers (Optional)</label>
                  <Textarea
                    placeholder="Any obstacles or challenges?"
                    value={dsuData.blockers}
                    onChange={(e) => setDsuData({ ...dsuData, blockers: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Learnings (Optional)</label>
                  <Textarea
                    placeholder="What did you learn?"
                    value={dsuData.learnings}
                    onChange={(e) => setDsuData({ ...dsuData, learnings: e.target.value })}
                    rows={2}
                  />
                </div>

                <Button onClick={handleSubmitDSU} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Submit Standup
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Task Section */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Task
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task *</label>
                <Input
                  placeholder="What are you working on?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Project *</label>
                <Select
                  value={newTask.project}
                  onValueChange={(value) => setNewTask({ ...newTask, project: value })}
                >
                  <SelectTrigger>
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
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) => setNewTask({ ...newTask, status: value })}
                >
                  <SelectTrigger>
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
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  placeholder="Details about the task..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Comments</label>
                <Textarea
                  placeholder="Any notes or updates..."
                  value={newTask.comments}
                  onChange={(e) => setNewTask({ ...newTask, comments: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={handleAddTask} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Tasks */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {tasks.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No tasks yet. Add your first task above!
              </div>
            ) : (
              <div className="divide-y">
                {tasks.map((task) => (
                  <div key={task._id} className="p-4 hover:bg-muted/30 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">{task.project}</span>
                          {task.comments && (
                            <span className="text-muted-foreground">• {task.comments}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleUpdateTask(task._id, { status: value })}
                        >
                          <SelectTrigger className="w-[140px]">
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
