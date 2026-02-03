import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { taskService } from '@/services/taskService';
import { projectService } from '@/services/projectService';
import { Task, Project } from '@/types/intern';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

/* ---------------- TYPES ---------------- */

type StatusFilter =
  | 'ALL'
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'ON_HOLD';

const STATUS_OPTIONS: StatusFilter[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'BLOCKED',
  'ON_HOLD',
];

/* 🔧 FIX: normalize status everywhere */
const normalizeStatus = (status: string) =>
  status.toUpperCase().replace(/\s+/g, '_');

/* ---------------- COMPONENT ---------------- */

const DailyUpdates: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('ALL');

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [taskForm, setTaskForm] = useState({
    title: '',
    project: '',
    status: 'NOT_STARTED',
    assignedBy: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [tasksData, projectsData] = await Promise.all([
      taskService.getAll({ intern_id: user?.id }),
      projectService.getAll(),
    ]);
    setTasks(tasksData);
    setProjects(projectsData);
    setLoading(false);
  };

  /* ---------------- KPI COUNTS ---------------- */
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    t => normalizeStatus(t.status) === 'COMPLETED'
  ).length;
  const inProgressTasks = tasks.filter(
    t => normalizeStatus(t.status) === 'IN_PROGRESS'
  ).length;
  const blockedTasks = tasks.filter(
    t => normalizeStatus(t.status) === 'BLOCKED'
  ).length;

  /* ---------------- FILTER ---------------- */
  const filteredTasks =
    statusFilter === 'ALL'
      ? tasks
      : tasks.filter(
          t => normalizeStatus(t.status) === statusFilter
        );

  /* ---------------- SUBMIT TASK ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !taskForm.title ||
      !taskForm.project ||
      !taskForm.status ||
      !taskForm.description
    ) {
      toast({
        title: 'Missing fields',
        description: 'All * fields are required',
        variant: 'destructive',
      });
      return;
    }

    const created = await taskService.create({
      ...taskForm,
      status: normalizeStatus(taskForm.status),
      internId: user?.id,
    });

    setTasks(prev => [created, ...prev]);
    setTaskForm({
      title: '',
      project: '',
      status: 'NOT_STARTED',
      assignedBy: '',
      description: '',
    });

    toast({ title: 'Task added successfully' });
  };

  /* ---------------- EDIT TASK (FIXED) ---------------- */
  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    const payload = {
      title: selectedTask.title,
      status: normalizeStatus(selectedTask.status),
    };

    await taskService.update(selectedTask._id, payload);

    setTasks(prev =>
      prev.map(t =>
        t._id === selectedTask._id
          ? { ...t, ...payload }
          : t
      )
    );

    setSelectedTask(null);
    toast({ title: 'Task updated' });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ---------------- KPI CARDS ---------------- */}
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            title="Total Tasks"
            value={totalTasks}
            icon={<Clock className="text-blue-600" />}
            onClick={() => setStatusFilter('ALL')}
          />
          <KpiCard
            title="Completed"
            value={completedTasks}
            icon={<CheckCircle className="text-green-600" />}
            onClick={() => setStatusFilter('COMPLETED')}
          />
          <KpiCard
            title="In Progress"
            value={inProgressTasks}
            icon={<Clock className="text-orange-600" />}
            onClick={() => setStatusFilter('IN_PROGRESS')}
          />
          <KpiCard
            title="Blocked"
            value={blockedTasks}
            icon={<AlertTriangle className="text-red-600" />}
            onClick={() => setStatusFilter('BLOCKED')}
          />
        </div>

        {/* ---------------- MAIN GRID ---------------- */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* ---------------- LEFT TABLE ---------------- */}
          <Card>
            <CardHeader>
              <CardTitle>Past Tasks</CardTitle>
              <div className="flex gap-2 mt-2">
                {STATUS_OPTIONS.map(s => (
                  <StatusBadge key={s} status={s} />
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-0">
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
                  {filteredTasks.map(task => (
                    <tr key={task._id} className="border-t">
                      <td className="p-3">{task.title}</td>
                      <td className="p-3">{task.project}</td>
                      <td className="p-3">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="p-3">{task.assignedBy || '-'}</td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setSelectedTask({
                              ...task,
                              status: normalizeStatus(task.status),
                            })
                          }
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* ---------------- RIGHT FORM ---------------- */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  placeholder="Task Name*"
                  value={taskForm.title}
                  onChange={e =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                />

                <Select
                  value={taskForm.project}
                  onValueChange={v =>
                    setTaskForm({ ...taskForm, project: v })
                  }
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
                  value={taskForm.status}
                  onValueChange={v =>
                    setTaskForm({ ...taskForm, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s}>
                        {s.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Assigned By"
                  value={taskForm.assignedBy}
                  onChange={e =>
                    setTaskForm({ ...taskForm, assignedBy: e.target.value })
                  }
                />

                <Textarea
                  placeholder="Description*"
                  value={taskForm.description}
                  onChange={e =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                />

                <Button
                  type="submit"
                  className="w-full bg-purple-700 hover:bg-purple-800"
                >
                  Submit Task
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ---------------- EDIT MODAL ---------------- */}
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

                <Select
                  value={selectedTask.status}
                  onValueChange={v =>
                    setSelectedTask({ ...selectedTask, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s}>
                        {s.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={handleUpdateTask} className="w-full">
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DailyUpdates;

/* ---------------- KPI CARD ---------------- */
const KpiCard = ({
  title,
  value,
  icon,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <Card
    onClick={onClick}
    className="cursor-pointer transition hover:bg-muted/50"
  >
    <CardContent className="p-4 flex items-center gap-4">
      {icon}
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </CardContent>
  </Card>
);
