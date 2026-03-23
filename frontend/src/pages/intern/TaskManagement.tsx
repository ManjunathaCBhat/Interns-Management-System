import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ClipboardList, Circle, Zap, CheckCircle2, ShieldAlert,
  Pencil, Trash2, Plus, GripVertical,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { taskService } from '@/services/taskService';
import { projectService } from '@/services/projectService';
import { Task, Project } from '@/types/intern';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Types ─────────────────────────────────────────────────────────────────────

type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

interface Column {
  id: TaskStatus;
  label: string;
  // Exact Blue Eclipse colors from assignment spec
  accentColor: string;       // hex — used for border strip, header border
  accentBg: string;          // light tint bg for column header
  accentText: string;        // text color for column title
  badgeBg: string;
  badgeText: string;
  emptyBorder: string;
  glowColor: string;         // tailwind shadow color on drag-over
  icon: React.ReactNode;
}

// ─── Column config — exact colors from spec ───────────────────────────────────
// Open: #8686AC  |  In Progress: #505081  |  Completed: green  |  Blocked: red

const COLUMNS: Column[] = [
  {
    id: 'NOT_STARTED',
    label: 'Open',
    accentColor: '#8686AC',
    accentBg: 'bg-[#f4f4f9]',
    accentText: 'text-[#5a5a8a]',
    badgeBg: 'bg-[#e8e8f2]',
    badgeText: 'text-[#5a5a8a]',
    emptyBorder: 'border-[#8686AC]',
    glowColor: 'shadow-[#8686AC]/30',
    icon: <Circle className="w-3.5 h-3.5" style={{ color: '#8686AC' }} />,
  },
  {
    id: 'IN_PROGRESS',
    label: 'In Progress',
    accentColor: '#505081',
    accentBg: 'bg-[#eeeef6]',
    accentText: 'text-[#505081]',
    badgeBg: 'bg-[#ddddf0]',
    badgeText: 'text-[#505081]',
    emptyBorder: 'border-[#505081]',
    glowColor: 'shadow-[#505081]/30',
    icon: <Zap className="w-3.5 h-3.5" style={{ color: '#505081' }} />,
  },
  {
    id: 'DONE',
    label: 'Completed',
    accentColor: '#16a34a',
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    emptyBorder: 'border-emerald-400',
    glowColor: 'shadow-emerald-300/40',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
  },
  {
    id: 'BLOCKED',
    label: 'Blocked',
    accentColor: '#dc2626',
    accentBg: 'bg-red-50',
    accentText: 'text-red-700',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    emptyBorder: 'border-red-400',
    glowColor: 'shadow-red-300/40',
    icon: <ShieldAlert className="w-3.5 h-3.5 text-red-600" />,
  },
];

// ─── KPI config ────────────────────────────────────────────────────────────────

const KPI_CONFIG = [
  { key: 'total',      label: 'Total Tasks', icon: <ClipboardList className="w-5 h-5" style={{ color: '#0F0E47' }} />, iconBg: 'bg-[#e8e8f2]', glow: 'hover:shadow-[#8686AC]/40' },
  { key: 'open',       label: 'Open',        icon: <Circle        className="w-5 h-5" style={{ color: '#8686AC' }} />, iconBg: 'bg-[#f0f0f8]', glow: 'hover:shadow-[#8686AC]/40' },
  { key: 'inProgress', label: 'In Progress', icon: <Zap           className="w-5 h-5" style={{ color: '#505081' }} />, iconBg: 'bg-[#eaeaf4]', glow: 'hover:shadow-[#505081]/40' },
  { key: 'completed',  label: 'Completed',   icon: <CheckCircle2  className="w-5 h-5 text-emerald-600"              />, iconBg: 'bg-emerald-100', glow: 'hover:shadow-emerald-300/40' },
  { key: 'blocked',    label: 'Blocked',     icon: <ShieldAlert   className="w-5 h-5 text-red-500"                  />, iconBg: 'bg-red-100',     glow: 'hover:shadow-red-300/40'     },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const normalizeStatus = (status: string): TaskStatus => {
  const s = status.toUpperCase().replace(/\s+/g, '_');
  if (s === 'COMPLETED') return 'DONE';
  return s as TaskStatus;
};

// ─── Animated Count Hook ───────────────────────────────────────────────────────

function useCountUp(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return display;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, icon, iconBg, glow,
}: { label: string; value: number; icon: React.ReactNode; iconBg: string; glow: string }) {
  const displayed = useCountUp(value);
  return (
    <Card className={`
      group cursor-default transition-all duration-300
      hover:-translate-y-1 hover:shadow-lg ${glow}
      border border-gray-200
    `}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0
          group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800 leading-none tabular-nums">{displayed}</p>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task, col, onEdit, onDelete, onDragStart, isDragging,
}: {
  task: Task;
  col: Column;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onDragStart: (e: React.DragEvent, t: Task) => void;
  isDragging: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, task)}
      className={`
        group relative bg-white border border-gray-200 rounded-xl overflow-hidden
        cursor-grab active:cursor-grabbing select-none
        hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-200
        ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}
      `}
    >
      {/* Left accent strip — status color */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: col.accentColor }}
      />

      {/* Drag grip */}
      <GripVertical className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300
        opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="pl-5 pr-3 py-4">
        {/* Title */}
        <p className="text-sm font-semibold text-gray-800 mb-2 pr-14 leading-snug">
          {task.title}
        </p>

        {/* Meta */}
        <div className="flex flex-col gap-0.5 mb-2">
          <p className="text-xs text-gray-500">
            <span className="text-gray-400">Project: </span>{task.project}
          </p>
          <p className="text-xs text-gray-500">
            <span className="text-gray-400">By: </span>{task.assignedBy || '—'}
          </p>
        </div>

        {/* Status badge */}
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: col.accentColor + '18', color: col.accentColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.accentColor }} />
          {col.label}
        </span>
      </div>

      {/* Action buttons — appear on hover */}
      <div className="absolute top-3 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onEdit(task)}
          className="w-7 h-7 rounded-lg bg-[#8686AC]/10 hover:bg-[#8686AC]/20 border border-[#8686AC]/30
            flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="Edit task"
        >
          <Pencil className="w-3 h-3" style={{ color: '#505081' }} />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200
            flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="Delete task"
        >
          <Trash2 className="w-3 h-3 text-red-500" />
        </button>
      </div>
    </div>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Add Task Modal ────────────────────────────────────────────────────────────

function AddTaskModal({
  open, onClose, onSave, projects,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; project: string; assignedBy: string; description: string }) => Promise<void>;
  projects: Project[];
}) {
  const [form, setForm] = useState({ title: '', project: '', assignedBy: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setForm({ title: '', project: '', assignedBy: '', description: '' }); setError(''); }
  }, [open]);

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Task Name is required.'); return; }
    if (!form.project) { setError('Project is required.'); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <p className="text-xs text-muted-foreground">Fields marked * are required</p>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Field label="Task Name" required>
            <Input
              placeholder="e.g. Design login page"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </Field>

          <Field label="Project" required>
            {projects.length > 0 ? (
              <Select value={form.project} onValueChange={v => setForm(f => ({ ...f, project: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project…" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p._id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Enter project name"
                value={form.project}
                onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
              />
            )}
          </Field>

          <Field label="Assigned By">
            <Input
              placeholder="e.g. Scrum Master"
              value={form.assignedBy}
              onChange={e => setForm(f => ({ ...f, assignedBy: e.target.value }))}
            />
          </Field>

          <Field label="Description">
            <Textarea
              placeholder="Describe the task…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="resize-none"
              rows={3}
            />
          </Field>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button
              className="flex-1 bg-[#0F0E47] hover:bg-[#272757] active:scale-95 transition-transform"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? 'Adding…' : 'Add Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Task Modal ───────────────────────────────────────────────────────────

function EditTaskModal({
  task, onClose, onSave, projects,
}: {
  task: Task | null;
  onClose: () => void;
  onSave: (t: Task) => Promise<void>;
  projects: Project[];
}) {
  const [form, setForm] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) setForm({ ...task, status: normalizeStatus(task.status) });
  }, [task]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={!!task} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
        {form && (
          <div className="space-y-4 pt-2">
            <Field label="Task Name" required>
              <Input value={form.title} onChange={e => setForm(f => f ? { ...f, title: e.target.value } : f)} />
            </Field>

            <Field label="Project" required>
              {projects.length > 0 ? (
                <Select value={form.project} onValueChange={v => setForm(f => f ? { ...f, project: v } : f)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {projects.map(p => <SelectItem key={p._id} value={p.name}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={form.project}
                  placeholder="Enter project name"
                  onChange={e => setForm(f => f ? { ...f, project: e.target.value } : f)}
                />
              )}
            </Field>

            <Field label="Assigned By">
              <Input
                value={form.assignedBy || ''}
                onChange={e => setForm(f => f ? { ...f, assignedBy: e.target.value } : f)}
              />
            </Field>

            <Field label="Status">
              <Select value={form.status} onValueChange={v => setForm(f => f ? { ...f, status: v as TaskStatus } : f)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COLUMNS.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button
                className="flex-1 bg-[#0F0E47] hover:bg-[#272757] active:scale-95 transition-transform"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteModal({ task, onClose, onConfirm }: {
  task: Task | null; onClose: () => void; onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  return (
    <Dialog open={!!task} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader><DialogTitle>Delete Task</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-800">"{task?.title}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            className="flex-1 active:scale-95 transition-transform"
            disabled={deleting}
            onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false); }}
          >
            {deleting ? 'Deleting…' : 'Confirm Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const TaskManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks]           = useState<Task[]>([]);
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [addOpen, setAddOpen]       = useState(false);
  const [editTask, setEditTask]     = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);

  const dragTaskRef  = useRef<Task | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOver, setDragOver]     = useState<TaskStatus | null>(null);

  const isIntern      = user?.role === 'intern';
  const isScrumMaster = user?.role === 'scrum_master';

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const taskParams = isIntern ? { intern_id: user?.id } : {};

      // Fetch tasks and projects independently so one failure doesn't block the other
      const items = await taskService.getAll(taskParams);
      setTasks(items);

      try {
        const projectsData = isIntern
          ? await projectService.getAssigned()
          : await projectService.getAll();
        // getAssigned may return [] if intern has no projects — that's fine,
        // the modal will fall back to a free-text input automatically
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch {
        // Projects failing shouldn't break the whole board
        setProjects([]);
      }
    } catch {
      toast({ title: 'Failed to load tasks', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user?.id, isIntern]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const kpis = {
    total:      tasks.length,
    open:       tasks.filter(t => normalizeStatus(t.status) === 'NOT_STARTED').length,
    inProgress: tasks.filter(t => normalizeStatus(t.status) === 'IN_PROGRESS').length,
    completed:  tasks.filter(t => normalizeStatus(t.status) === 'DONE').length,
    blocked:    tasks.filter(t => normalizeStatus(t.status) === 'BLOCKED').length,
  };

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async (data: { title: string; project: string; assignedBy: string; description: string }) => {
    const created = await taskService.create({
      ...data,
      status: 'NOT_STARTED',
      internId: user?.id,
    });
    setTasks(prev => [created, ...prev]);
    toast({ title: '✅ Task created successfully!' });
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = async (updated: Task) => {
    const payload = {
      title: updated.title,
      project: updated.project,
      assignedBy: updated.assignedBy,
      status: normalizeStatus(updated.status),
    };
    const result = await taskService.update(updated._id, payload);
    setTasks(prev => prev.map(t => t._id === updated._id ? { ...t, ...result } : t));
    toast({ title: 'Task updated!' });
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTask) return;
    try {
      await taskService.delete(deleteTask._id);
      setTasks(prev => prev.filter(t => t._id !== deleteTask._id));
      setDeleteTask(null);
      toast({ title: 'Task deleted.' });
    } catch {
      toast({ title: 'Failed to delete task.', variant: 'destructive' });
    }
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    dragTaskRef.current = task;
    setDraggingId(task._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    dragTaskRef.current = null;
  };

  const handleDrop = async (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    setDragOver(null);
    const task = dragTaskRef.current;
    setDraggingId(null);
    dragTaskRef.current = null;
    if (!task || normalizeStatus(task.status) === colId) return;

    // Optimistic update
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: colId } : t));

    try {
      await taskService.update(task._id, { status: colId });
      toast({ title: `Moved to ${COLUMNS.find(c => c.id === colId)?.label}` });
    } catch {
      // Revert on failure
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: task.status } : t));
      toast({ title: 'Failed to update status.', variant: 'destructive' });
    }
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <div className="grid gap-3 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-96 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Task Board</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isScrumMaster ? 'Managing intern tasks' : 'Your sprint tasks'}
            </p>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {KPI_CONFIG.map(cfg => (
            <KpiCard
              key={cfg.key}
              label={cfg.label}
              value={kpis[cfg.key as keyof typeof kpis]}
              icon={cfg.icon}
              iconBg={cfg.iconBg}
              glow={cfg.glow}
            />
          ))}
        </div>

        {/* ── Scrum Board ── */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => normalizeStatus(t.status) === col.id);
            const isOver   = dragOver === col.id;

            return (
              <div
                key={col.id}
                onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
                onDragLeave={e => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null);
                }}
                onDrop={e => handleDrop(e, col.id)}
                className={`
                  flex flex-col rounded-2xl border min-h-[480px] transition-all duration-200
                  ${isOver
                    ? `scale-[1.01] shadow-xl ${col.glowColor} bg-white`
                    : 'bg-white shadow-sm'
                  }
                `}
                style={{
                  borderColor: isOver ? col.accentColor : '#e5e7eb',
                  borderWidth: isOver ? '2px' : '1px',
                }}
              >
                {/* Column header with accent top border */}
                <div
                  className={`flex items-center justify-between px-4 py-3 rounded-t-2xl border-b border-gray-100 ${col.accentBg}`}
                  style={{ borderTop: `3px solid ${col.accentColor}`, borderRadius: '1rem 1rem 0 0' }}
                >
                  <div className="flex items-center gap-2">
                    {col.icon}
                    <span className={`text-sm font-semibold ${col.accentText}`}>{col.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${col.badgeBg} ${col.badgeText} rounded-full px-2 py-0.5`}
                    >
                      {colTasks.length}
                    </span>
                    {/* Add Task button ONLY in Open column header — per assignment spec */}
                    {col.id === 'NOT_STARTED' && (
                      <button
                        onClick={() => setAddOpen(true)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-all
                          hover:scale-110 active:scale-95"
                        style={{ backgroundColor: '#8686AC', color: 'white' }}
                        title="Add task"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2.5 p-3 flex-1">
                  {colTasks.length === 0 ? (
                    <div className={`
                      flex-1 flex flex-col items-center justify-center gap-2
                      rounded-xl border-2 border-dashed transition-colors duration-200
                      ${isOver ? col.emptyBorder : 'border-gray-200'}
                    `}>
                      <ClipboardList className="w-6 h-6 text-gray-300" />
                      <p className="text-xs text-gray-400">
                        {isOver ? 'Drop here' : 'No tasks'}
                      </p>
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        col={col}
                        onEdit={t => setEditTask(t)}
                        onDelete={t => setDeleteTask(t)}
                        onDragStart={handleDragStart}
                        isDragging={draggingId === task._id}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modals ── */}
      <AddTaskModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleCreate}
        projects={projects}
      />
      <EditTaskModal
        task={editTask}
        onClose={() => setEditTask(null)}
        onSave={handleEdit}
        projects={projects}
      />
      <DeleteModal
        task={deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
};

export default TaskManagement;
