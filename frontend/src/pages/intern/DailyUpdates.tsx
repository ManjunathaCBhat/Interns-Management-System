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
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'DONE', label: 'Done' },
];

const DailyUpdates: React.FC = () => {
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

      const intern_id = user?.id || '';

      const [tasksData, projectsData, dsuResponse] = await Promise.all([
        // ✅ FIXED: pass object, not string
        taskService.getAll({ intern_id,}),
        projectService.getAll(),
        dsuService.getByDate(intern_id, today),
      ]);

      setTasks(tasksData as Task[]);
      setProjects(projectsData as Project[]);

      if (dsuResponse) {
        setHasSubmittedDSU(true);
        setDsuData({
          yesterday: dsuResponse.yesterday ?? '',
          today: dsuResponse.today ?? '',
          blockers: dsuResponse.blockers ?? '',
          learnings: dsuResponse.learnings ?? '',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load daily updates',
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
        description: 'Yesterday and Today are required',
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
      toast({ title: 'DSU submitted successfully' });
    } catch {
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
        description: 'Task title and project are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const created = await taskService.create({
        ...newTask,
        internId: user?.id || '',
        date: today,
      });

      setTasks((prev) => [...prev, created as Task]);
      setNewTask({
        title: '',
        description: '',
        project: '',
        status: 'NOT_STARTED',
        comments: '',
      });

      toast({ title: 'Task added successfully' });
    } catch {
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
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Daily Updates</h1>

        <Button onClick={handleSubmitDSU}>
          <Save className="mr-2 h-4 w-4" />
          Submit Standup
        </Button>

        {tasks.map((task) => (
          <div key={task._id} className="flex items-center gap-4">
            <span>{task.title}</span>
            <Select
              value={task.status}
              onValueChange={(value) =>
                handleUpdateTask(task._id, { status: value })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default DailyUpdates;