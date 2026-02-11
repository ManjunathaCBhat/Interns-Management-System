import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { projectService } from '@/services/projectService';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/intern';

interface InternOption {
  _id: string;
  name: string;
  email: string;
}

interface ProjectUpdateItem {
  _id: string;
  title: string;
  status: string;
  internName?: string;
  updated_at?: string;
  created_at?: string;
}

const ProjectManagement: React.FC = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [updates, setUpdates] = useState<ProjectUpdateItem[]>([]);
  const [interns, setInterns] = useState<InternOption[]>([]);
  const [selectedInternId, setSelectedInternId] = useState('');
  const [loading, setLoading] = useState(true);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    mentor: '',
    startDate: '',
    endDate: '',
    techStack: '',
  });

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const loadProjects = async () => {
    const data = await projectService.getAll();
    setProjects(data);
    if (!selectedProjectId && data.length) {
      setSelectedProjectId(data[0]._id);
    }
  };

  const loadInterns = async () => {
    try {
      const response = await apiClient.get('/interns/', { params: { skip: 0, limit: 100 } });
      const items = Array.isArray(response.data.items) ? response.data.items : [];
      setInterns(
        items.map((intern: any) => ({
          _id: intern._id,
          name: intern.name,
          email: intern.email,
        }))
      );
    } catch (error) {
      setInterns([]);
    }
  };

  const loadUpdates = async (projectId: string) => {
    const data = await projectService.getUpdates(projectId, 10);
    setUpdates(data);
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([loadProjects(), loadInterns()]);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadUpdates(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleCreateProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newProject.name || !newProject.mentor || !newProject.startDate) {
      toast({
        title: 'Missing fields',
        description: 'Name, mentor, and start date are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await projectService.create({
        name: newProject.name,
        description: newProject.description || undefined,
        mentor: newProject.mentor,
        startDate: newProject.startDate,
        endDate: newProject.endDate || undefined,
        techStack: newProject.techStack
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });

      setNewProject({
        name: '',
        description: '',
        mentor: '',
        startDate: '',
        endDate: '',
        techStack: '',
      });
      toast({
        title: 'Project created',
        description: 'Project has been added to the list.',
      });
      await loadProjects();
    } catch (error: any) {
      toast({
        title: 'Create failed',
        description: error?.response?.data?.detail || 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  const handleAssignIntern = async () => {
    if (!selectedProject || !selectedInternId) return;
    try {
      const updated = await projectService.assignInterns(selectedProject._id, [selectedInternId]);
      setProjects((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );
      setSelectedInternId('');
      toast({
        title: 'Intern assigned',
        description: 'Intern added to project.',
      });
    } catch (error: any) {
      toast({
        title: 'Assignment failed',
        description: error?.response?.data?.detail || 'Failed to assign intern',
        variant: 'destructive',
      });
    }
  };

  const assignedInternNames = useMemo(() => {
    if (!selectedProject) return [];
    const internIds = selectedProject.internIds || [];
    return internIds
      .map((id) => interns.find((intern) => intern._id === id))
      .filter(Boolean)
      .map((intern) => intern?.name || 'Unknown');
  }, [selectedProject, interns]);

  return (
    <DashboardLayout>
      {loading && (
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
              <Skeleton className="h-24 w-full md:col-span-2" />
              <Skeleton className="h-10 w-full md:col-span-2" />
            </CardContent>
          </Card>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full" />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {!loading && (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Project Management</h1>
          <p className="text-muted-foreground">Add projects, assign interns, and track updates.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateProject}>
              <Input
                placeholder="Project name"
                value={newProject.name}
                onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Mentor"
                value={newProject.mentor}
                onChange={(e) => setNewProject((prev) => ({ ...prev, mentor: e.target.value }))}
              />
              <Input
                type="date"
                value={newProject.startDate}
                onChange={(e) => setNewProject((prev) => ({ ...prev, startDate: e.target.value }))}
              />
              <Input
                type="date"
                value={newProject.endDate}
                onChange={(e) => setNewProject((prev) => ({ ...prev, endDate: e.target.value }))}
              />
              <Input
                placeholder="Tech stack (comma separated)"
                value={newProject.techStack}
                onChange={(e) => setNewProject((prev) => ({ ...prev, techStack: e.target.value }))}
              />
              <Textarea
                className="md:col-span-2"
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
              />
              <Button type="submit" className="md:col-span-2 w-full">
                Create Project
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <button
                  key={project._id}
                  type="button"
                  onClick={() => setSelectedProjectId(project._id)}
                  className={`rounded-xl border p-4 text-left transition-shadow hover:shadow-md ${
                    selectedProjectId === project._id ? 'border-[#0F0E47] shadow-md' : 'border-border'
                  }`}
                >
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.description || 'No description'}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Interns: {(project.internIds || []).length}
                  </div>
                </button>
              ))}
              {projects.length === 0 && (
                <div className="text-sm text-muted-foreground">No projects created yet.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedProject && (
                <p className="text-sm text-muted-foreground">Select a project to view details.</p>
              )}

              {selectedProject && (
                <>
                  <div>
                    <h2 className="text-lg font-semibold">{selectedProject.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedProject.mentor}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Assigned Interns</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {assignedInternNames.length ? (
                        assignedInternNames.map((name) => (
                          <span
                            key={name}
                            className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
                          >
                            {name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No interns assigned</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Assign Intern</p>
                    <div className="flex gap-2">
                      <Select value={selectedInternId} onValueChange={setSelectedInternId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select intern" />
                        </SelectTrigger>
                        <SelectContent>
                          {interns.map((intern) => (
                            <SelectItem key={intern._id} value={intern._id}>
                              {intern.name} ({intern.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" onClick={handleAssignIntern}>
                        Add
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Latest Updates</p>
                    <div className="mt-2 space-y-2">
                      {updates.length === 0 && (
                        <p className="text-xs text-muted-foreground">No updates found.</p>
                      )}
                      {updates.map((task) => (
                        <div
                          key={task._id}
                          className="rounded-lg border p-3 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{task.title}</span>
                            <span className="text-xs text-muted-foreground">{task.status}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.internName || 'Unknown intern'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </DashboardLayout>
  );
};

export default ProjectManagement;
