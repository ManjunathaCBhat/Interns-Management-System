// src/pages/admin/InternDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Calendar,
  TrendingUp,
  Edit,
  Trash,
  MapPin,
  Award,
  User,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Avatar from '@/components/shared/Avatar';
import StatusBadge from '@/components/shared/StatusBadge';
import { internService } from '@/services/internService';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Intern {
  _id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  branch: string;
  year: number;
  cgpa: number;
  domain: string;
  internType: string;
  batch?: string;
  status: string;
  mentor: string;
  currentProject?: string;
  startDate: string;
  endDate: string;
  taskCount: number;
  completedTasks: number;
  dsuStreak: number;
  skills: string[];
  isPaid: boolean;
}

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  project: string;
}

interface DSUEntry {
  _id: string;
  date: string;
  yesterday: string;
  today: string;
  blockers?: string;
  status: string;
}

const InternDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [intern, setIntern] = useState<Intern | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dsus, setDsus] = useState<DSUEntry[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInternDetails();
    }
  }, [id]);

  const fetchInternDetails = async () => {
    try {
      setLoading(true);
      
      // Use internService if available
      const internRes = await internService.getById(id!);
      
      // Fetch tasks and DSUs in parallel
      const [tasksRes, dsuRes] = await Promise.all([
        apiClient.get(`/tasks/`, { params: { intern_id: id } }),
        apiClient.get(`/dsu/`, { params: { intern_id: id, limit: 5 } }),
      ]);

      setIntern(internRes);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : tasksRes.data.items || []);
      setDsus(Array.isArray(dsuRes.data) ? dsuRes.data : dsuRes.data.items || []);
    } catch (error: any) {
      console.error('Failed to fetch intern details:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to load intern details',
        variant: 'destructive',
      });
      
      // If intern not found, redirect after showing error
      if (error.response?.status === 404) {
        setTimeout(() => navigate('/admin/interns'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!intern) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${intern.name}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setDeleting(true);
      await internService.delete(id!);
      
      toast({
        title: 'Success',
        description: `${intern.name} has been deleted successfully`,
      });
      
      navigate('/admin/interns');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete intern',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-muted-foreground">Loading intern details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!intern) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Intern not found</h2>
          <p className="text-muted-foreground mb-4">
            The intern you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/admin/interns')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Interns
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const taskCompletion =
    intern.taskCount > 0
      ? Math.round((intern.completedTasks / intern.taskCount) * 100)
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/admin/interns')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Interns
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/admin/interns/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Intern Profile */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start gap-4">
                <Avatar name={intern.name} size="lg" />
                <StatusBadge status={intern.status} />
                <Badge variant={intern.internType === 'rs' ? 'default' : 'secondary'}>
                  {intern.internType.toUpperCase()}
                </Badge>
                {intern.isPaid && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    💰 Paid
                  </Badge>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{intern.name}</h1>
                  <p className="text-lg text-muted-foreground">{intern.domain}</p>
                  {intern.currentProject && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Currently working on: <strong>{intern.currentProject}</strong>
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${intern.email}`}
                      className="text-sm hover:underline"
                    >
                      {intern.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`tel:${intern.phone}`}
                      className="text-sm hover:underline"
                    >
                      {intern.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {intern.degree} - {intern.branch}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{intern.college}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Mentor: {intern.mentor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(intern.startDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })} - {new Date(intern.endDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  {intern.batch && (
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">{intern.batch}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-muted-foreground">Task Completion</p>
                <p className="text-3xl font-bold mt-1">{taskCompletion}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {intern.completedTasks}/{intern.taskCount} tasks
                </p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${taskCompletion}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl mb-2">🔥</p>
                <p className="text-sm text-muted-foreground">DSU Streak</p>
                <p className="text-3xl font-bold mt-1">{intern.dsuStreak}</p>
                <p className="text-xs text-muted-foreground mt-1">consecutive days</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-muted-foreground">CGPA</p>
                <p className="text-3xl font-bold mt-1">{intern.cgpa.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">out of 10.0</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-muted-foreground">Academic Year</p>
                <p className="text-3xl font-bold mt-1">{intern.year}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {intern.college}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills */}
        {intern.skills && intern.skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {intern.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tasks</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/tasks', { state: { internId: id } })}
            >
              View All →
            </Button>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No tasks assigned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.project}</p>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          task.status === 'DONE' || task.status === 'completed' 
                            ? 'default' 
                            : 'secondary'
                        }
                      >
                        {task.status}
                      </Badge>
                      <Badge
                        variant={
                          task.priority === 'high' || task.priority === 'urgent'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent DSUs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent DSUs</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/dsu-board', { state: { internId: id } })}
            >
              View All →
            </Button>
          </CardHeader>
          <CardContent>
            {dsus.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No DSU submissions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dsus.map((dsu) => (
                  <div key={dsu._id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {new Date(dsu.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <Badge variant={dsu.status === 'reviewed' ? 'default' : 'secondary'}>
                        {dsu.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="bg-muted/50 p-2 rounded">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          ✅ YESTERDAY
                        </p>
                        <p>{dsu.yesterday}</p>
                      </div>
                      <div className="bg-muted/50 p-2 rounded">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          📝 TODAY
                        </p>
                        <p>{dsu.today}</p>
                      </div>
                      {dsu.blockers && dsu.blockers.trim() && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
                          <p className="text-xs font-semibold text-orange-600 mb-1">
                            ⚠️ BLOCKERS
                          </p>
                          <p className="text-orange-700 dark:text-orange-300">{dsu.blockers}</p>
                        </div>
                      )}
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
};

export default InternDetails;
