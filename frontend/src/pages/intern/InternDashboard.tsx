import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Pencil,
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { taskService } from '@/services/taskService';
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useToast } from '@/hooks/use-toast';
import { Task, Project } from '@/types/intern';

const STATUS_OPTIONS = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'BLOCKED', label: 'Blocked' },
];

export default function DailyUpdates() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [newTask, setNewTask] = useState({
    title: '',
    project: '',
    status: '',
    assignedBy: '',
    description: '',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [taskData, projectData] = await Promise.all([
        taskService.getAll({ intern_id: user?.id }),
        projectService.getAll(),
      ]);
      setTasks(taskData);
      setProjects(projectData);
    } catch {
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const blockedTasks = tasks.filter(t => t.status === 'BLOCKED');
  const pastTasks = tasks.filter(
    t => t.status === 'COMPLETED' || t.status === 'DONE'
  );

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.project || !newTask.status) {
      toast({
        title: 'Missing fields',
        description: 'Task Name, Project and Status are required',
        variant: 'destructive',
      });
      return;
    }

    await taskService.create({
      ...newTask,
      internId: user?.id,
    });

    toast({ title: 'Task added successfully' });
    setNewTask({ title: '', project: '', status: '', assignedBy: '', description: '' });
    fetchAll();
  };

  const handleEditTask = async () => {
    if (!selectedTask) return;

    await taskService.update(selectedTask._id, selectedTask);
    toast({ title: 'Task updated successfully' });
    setSelectedTask(null);
    fetchAll();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-64 flex items-center justify-center">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* BLOCKED TASKS KPI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-red-600" />
              Blocked Tasks ({blockedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {blockedTasks.length === 0 ? (
              <p className="text-muted-foreground">No blocked tasks 🎉</p>
            ) : (
              <ul className="list-disc pl-6">
                {blockedTasks.map(t => (
                  <li
                    key={t._id}
                    className="cursor-pointer text-red-600 hover:underline"
                    onClick={() => setSelectedTask(t)}
                  >
                    {t.title}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 50–50 LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT PANEL – PAST TASKS */}
          <Card>
            <CardHeader>
              <CardTitle>Past / Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pastTasks.length === 0 ? (
                <p className="p-6 text-muted-foreground text-center">
                  No completed tasks
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left">Task</th>
                      <th className="p-3 text-left">Project</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Assigned By</th>
                      <th className="p-3 text-right">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastTasks.map(task => (
                      <tr key={task._id} className="border-t">
                        <td className="p-3">{task.title}</td>
                        <td className="p-3">{task.project}</td>
                        <td className="p-3">{task.status}</td>
                        <td className="p-3">{task.assignedBy || '-'}</td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTask(task)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* RIGHT PANEL – SUBMIT FORM */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Task Name*"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              />

              <Select
                value={newTask.project}
                onValueChange={v => setNewTask({ ...newTask, project: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Project*" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p._id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newTask.status}
                onValueChange={v => setNewTask({ ...newTask, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status*" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Assigned By (Optional)"
                value={newTask.assignedBy}
                onChange={e => setNewTask({ ...newTask, assignedBy: e.target.value })}
              />

              <Textarea
                placeholder="Description (Optional)"
                value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
              />

              <Button className="w-full" onClick={handleAddTask}>
                Submit
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* EDIT MODAL */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>

            {selectedTask && (
              <div className="space-y-4">
                <Input
                  value={selectedTask.title}
                  onChange={e =>
                    setSelectedTask({ ...selectedTask, title: e.target.value })
                  }
                />

                <Textarea
                  value={selectedTask.description || ''}
                  onChange={e =>
                    setSelectedTask({ ...selectedTask, description: e.target.value })
                  }
                />

                <Button onClick={handleEditTask} className="w-full">
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}