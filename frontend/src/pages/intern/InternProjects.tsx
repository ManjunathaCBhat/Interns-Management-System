import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Project {
  _id: string;
  name: string;
  description?: string;
  mentor: string;
  startDate: string;
  endDate?: string;
  techStack?: string[];
}

interface Task {
  _id: string;
  title: string;
  status: string;
  description?: string;
}

const InternProjects: React.FC = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  useEffect(() => {
    loadMyProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectTasks(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadMyProjects = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/projects/my-projects');
      setProjects(response.data);
      
      if (response.data.length > 0) {
        setSelectedProjectId(response.data[0]._id);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load your projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTasks = async (projectId: string) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/tasks`);
      setTasks(response.data);
    } catch (error) {
      setTasks([]);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">View projects assigned to you and claim tasks</p>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No projects assigned to you yet. Contact your admin to get assigned to a project.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Select Project</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedProject && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Project Name</p>
                      <p className="text-lg font-semibold">{selectedProject.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Mentor</p>
                      <p>{selectedProject.mentor}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                      <p>{formatDate(selectedProject.startDate)}</p>
                    </div>
                    
                    {selectedProject.endDate && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">End Date</p>
                        <p>{formatDate(selectedProject.endDate)}</p>
                      </div>
                    )}
                    
                    {selectedProject.description && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                        <p>{selectedProject.description}</p>
                      </div>
                    )}
                    
                    {selectedProject.techStack && selectedProject.techStack.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tech Stack</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedProject.techStack.map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Available Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No tasks available for this project yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {tasks.map((task) => (
                          <div
                            key={task._id}
                            className="p-3 border rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{task.title}</h3>
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                {task.status}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InternProjects;