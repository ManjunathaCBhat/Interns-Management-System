import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { taskService } from '@/services/taskService';
import { dsuService } from '@/services/dsuService';
import { Task } from '@/types/intern';

const InternDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [taskForm, setTaskForm] = useState({
    title: '',
    project: '',
    status: '',
    assignedBy: '',
    description: '',
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const tasksData = await taskService.getAll({ intern_id: user?.id });
      setTasks(tasksData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const blockedTasks = tasks.filter(
    (t) => t.status === 'BLOCKED' || t.status === 'blocked'
  );

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskForm.title || !taskForm.project || !taskForm.status) {
      toast({
        title: 'Missing fields',
        description: 'Task Name, Project and Status are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await taskService.create({
        ...taskForm,
        internId: user?.id,
      });

      toast({
        title: 'Task added',
        description: 'Task successfully created',
      });

      setTaskForm({
        title: '',
        project: '',
        status: '',
        assignedBy: '',
        description: '',
      });

      fetchData();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* KPI ROW */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <Clock />
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-xl font-bold">{tasks.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <CheckCircle />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">
                  {tasks.filter(t => t.status === 'DONE' || t.status === 'completed').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <AlertTriangle />
              <div>
                <p className="text-sm text-muted-foreground">Blocked Tasks</p>
                <p className="text-xl font-bold">{blockedTasks.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MAIN 50–50 LAYOUT */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* LEFT PANEL – TASK HISTORY */}
          <Card>
            <CardHeader>
              <CardTitle>Past Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {tasks.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No tasks available
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left">Task</th>
                      <th className="p-3 text-left">Project</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Assigned By</th>
                      <th className="p-3 text-right">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task._id} className="border-t">
                        <td className="p-3">{task.title}</td>
                        <td className="p-3">{task.project}</td>
                        <td className="p-3">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="p-3">
                          {new Date(task.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">{task.assignedBy || '-'}</td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline">
                            Edit
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
            <CardContent>
              <form className="space-y-4" onSubmit={handleTaskSubmit}>
                <Input
                  placeholder="Task Name*"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Project*"
                  value={taskForm.project}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, project: e.target.value })
                  }
                  required
                />

                <select
                  className="w-full border rounded px-3 py-2"
                  value={taskForm.status}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, status: e.target.value })
                  }
                  required
                >
                  <option value="">Status*</option>
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="BLOCKED">Blocked</option>
                </select>

                <Input
                  placeholder="Assigned By (Optional)"
                  value={taskForm.assignedBy}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, assignedBy: e.target.value })
                  }
                />

                <Textarea
                  placeholder="Description (Optional)"
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                />

                <Button type="submit" className="w-full">
                  Submit Task
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