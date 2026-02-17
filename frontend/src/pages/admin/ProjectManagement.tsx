// import React, { useEffect, useMemo, useState } from 'react';
// import DashboardLayout from '@/components/layout/DashboardLayout';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Skeleton } from '@/components/ui/skeleton';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { projectService } from '@/services/projectService';
// import apiClient from '@/lib/api';
// import { useToast } from '@/hooks/use-toast';
// import { Project } from '@/types/intern';

// interface InternOption {
//   _id: string;
//   name: string;
//   email: string;
// }

// interface ProjectUpdateItem {
//   _id: string;
//   title: string;
//   status: string;
//   internName?: string;
//   updated_at?: string;
//   created_at?: string;
// }

// const ProjectManagement: React.FC = () => {
//   const { toast } = useToast();
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [selectedProjectId, setSelectedProjectId] = useState('');
//   const [updates, setUpdates] = useState<ProjectUpdateItem[]>([]);
//   const [interns, setInterns] = useState<InternOption[]>([]);
//   const [selectedInternId, setSelectedInternId] = useState('');
//   const [loading, setLoading] = useState(true);

//   const [newProject, setNewProject] = useState({
//     name: '',
//     description: '',
//     mentor: '',
//     startDate: '',
//     endDate: '',
//     techStack: '',
//   });

//   const selectedProject = useMemo(
//     () => projects.find((project) => project._id === selectedProjectId) || null,
//     [projects, selectedProjectId]
//   );

//   const loadProjects = async () => {
//     const data = await projectService.getAll();
//     setProjects(data);
//     if (!selectedProjectId && data.length) {
//       setSelectedProjectId(data[0]._id);
//     }
//   };

//   const loadInterns = async () => {
//     try {
//       const response = await apiClient.get('/interns/', { params: { skip: 0, limit: 100 } });
//       const items = Array.isArray(response.data.items) ? response.data.items : [];
//       setInterns(
//         items.map((intern: any) => ({
//           _id: intern._id,
//           name: intern.name,
//           email: intern.email,
//         }))
//       );
//     } catch (error) {
//       setInterns([]);
//     }
//   };

//   const loadUpdates = async (projectId: string) => {
//     const data = await projectService.getUpdates(projectId, 10);
//     setUpdates(data);
//   };

//   useEffect(() => {
//     const loadAll = async () => {
//       setLoading(true);
//       try {
//         await Promise.all([loadProjects(), loadInterns()]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadAll();
//   }, []);

//   useEffect(() => {
//     if (selectedProjectId) {
//       loadUpdates(selectedProjectId);
//     }
//   }, [selectedProjectId]);

//   const handleCreateProject = async (event: React.FormEvent) => {
//     event.preventDefault();
//     if (!newProject.name || !newProject.mentor || !newProject.startDate) {
//       toast({
//         title: 'Missing fields',
//         description: 'Name, mentor, and start date are required.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     try {
//       await projectService.create({
//         name: newProject.name,
//         description: newProject.description || undefined,
//         mentor: newProject.mentor,
//         startDate: newProject.startDate,
//         endDate: newProject.endDate || undefined,
//         techStack: newProject.techStack
//           .split(',')
//           .map((item) => item.trim())
//           .filter(Boolean),
//       });

//       setNewProject({
//         name: '',
//         description: '',
//         mentor: '',
//         startDate: '',
//         endDate: '',
//         techStack: '',
//       });
//       toast({
//         title: 'Project created',
//         description: 'Project has been added to the list.',
//       });
//       await loadProjects();
//     } catch (error: any) {
//       toast({
//         title: 'Create failed',
//         description: error?.response?.data?.detail || 'Failed to create project',
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleAssignIntern = async () => {
//     if (!selectedProject || !selectedInternId) return;
//     try {
//       const updated = await projectService.assignInterns(selectedProject._id, [selectedInternId]);
//       setProjects((prev) =>
//         prev.map((item) => (item._id === updated._id ? updated : item))
//       );
//       setSelectedInternId('');
//       toast({
//         title: 'Intern assigned',
//         description: 'Intern added to project.',
//       });
//     } catch (error: any) {
//       toast({
//         title: 'Assignment failed',
//         description: error?.response?.data?.detail || 'Failed to assign intern',
//         variant: 'destructive',
//       });
//     }
//   };

//   const assignedInternNames = useMemo(() => {
//     if (!selectedProject) return [];
//     const internIds = selectedProject.internIds || [];
//     return internIds
//       .map((id) => interns.find((intern) => intern._id === id))
//       .filter(Boolean)
//       .map((intern) => intern?.name || 'Unknown');
//   }, [selectedProject, interns]);

//   return (
//     <DashboardLayout>
//       {loading && (
//         <div className="space-y-6">
//           <div>
//             <Skeleton className="h-8 w-48" />
//             <Skeleton className="h-4 w-64 mt-2" />
//           </div>
//           <Card>
//             <CardHeader>
//               <Skeleton className="h-5 w-32" />
//             </CardHeader>
//             <CardContent className="grid gap-4 md:grid-cols-2">
//               {Array.from({ length: 4 }).map((_, index) => (
//                 <Skeleton key={index} className="h-10 w-full" />
//               ))}
//               <Skeleton className="h-24 w-full md:col-span-2" />
//               <Skeleton className="h-10 w-full md:col-span-2" />
//             </CardContent>
//           </Card>
//           <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
//             <Card>
//               <CardHeader>
//                 <Skeleton className="h-5 w-28" />
//               </CardHeader>
//               <CardContent className="grid gap-4 md:grid-cols-2">
//                 {Array.from({ length: 4 }).map((_, index) => (
//                   <Skeleton key={index} className="h-24 w-full" />
//                 ))}
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <Skeleton className="h-5 w-32" />
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <Skeleton className="h-6 w-40" />
//                 <Skeleton className="h-4 w-48" />
//                 <Skeleton className="h-10 w-full" />
//                 <Skeleton className="h-32 w-full" />
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       )}
//       {!loading && (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-2xl font-bold">Project Management</h1>
//           <p className="text-muted-foreground">Add projects, assign interns, and track updates.</p>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>Add Project</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateProject}>
//               <Input
//                 placeholder="Project name"
//                 value={newProject.name}
//                 onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
//               />
//               <Input
//                 placeholder="Mentor"
//                 value={newProject.mentor}
//                 onChange={(e) => setNewProject((prev) => ({ ...prev, mentor: e.target.value }))}
//               />
//               <Input
//                 type="date"
//                 value={newProject.startDate}
//                 onChange={(e) => setNewProject((prev) => ({ ...prev, startDate: e.target.value }))}
//               />
//               <Input
//                 type="date"
//                 value={newProject.endDate}
//                 onChange={(e) => setNewProject((prev) => ({ ...prev, endDate: e.target.value }))}
//               />
//               <Input
//                 placeholder="Tech stack (comma separated)"
//                 value={newProject.techStack}
//                 onChange={(e) => setNewProject((prev) => ({ ...prev, techStack: e.target.value }))}
//               />
//               <Textarea
//                 className="md:col-span-2"
//                 placeholder="Description"
//                 value={newProject.description}
//                 onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
//               />
//               <Button type="submit" className="md:col-span-2 w-full">
//                 Create Project
//               </Button>
//             </form>
//           </CardContent>
//         </Card>

//         <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
//           <Card>
//             <CardHeader>
//               <CardTitle>Projects</CardTitle>
//             </CardHeader>
//             <CardContent className="grid gap-4 md:grid-cols-2">
//               {projects.map((project) => (
//                 <button
//                   key={project._id}
//                   type="button"
//                   onClick={() => setSelectedProjectId(project._id)}
//                   className={`rounded-xl border p-4 text-left transition-shadow hover:shadow-md ${
//                     selectedProjectId === project._id ? 'border-[#0F0E47] shadow-md' : 'border-border'
//                   }`}
//                 >
//                   <h3 className="text-lg font-semibold">{project.name}</h3>
//                   <p className="text-sm text-muted-foreground mt-1">
//                     {project.description || 'No description'}
//                   </p>
//                   <div className="mt-3 text-xs text-muted-foreground">
//                     Interns: {(project.internIds || []).length}
//                   </div>
//                 </button>
//               ))}
//               {projects.length === 0 && (
//                 <div className="text-sm text-muted-foreground">No projects created yet.</div>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Project Details</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {!selectedProject && (
//                 <p className="text-sm text-muted-foreground">Select a project to view details.</p>
//               )}

//               {selectedProject && (
//                 <>
//                   <div>
//                     <h2 className="text-lg font-semibold">{selectedProject.name}</h2>
//                     <p className="text-sm text-muted-foreground">{selectedProject.mentor}</p>
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium">Assigned Interns</p>
//                     <div className="flex flex-wrap gap-2 mt-2">
//                       {assignedInternNames.length ? (
//                         assignedInternNames.map((name) => (
//                           <span
//                             key={name}
//                             className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
//                           >
//                             {name}
//                           </span>
//                         ))
//                       ) : (
//                         <span className="text-xs text-muted-foreground">No interns assigned</span>
//                       )}
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <p className="text-sm font-medium">Assign Intern</p>
//                     <div className="flex gap-2">
//                       <Select value={selectedInternId} onValueChange={setSelectedInternId}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select intern" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {interns.map((intern) => (
//                             <SelectItem key={intern._id} value={intern._id}>
//                               {intern.name} ({intern.email})
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <Button variant="outline" onClick={handleAssignIntern}>
//                         Add
//                       </Button>
//                     </div>
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium">Latest Updates</p>
//                     <div className="mt-2 space-y-2">
//                       {updates.length === 0 && (
//                         <p className="text-xs text-muted-foreground">No updates found.</p>
//                       )}
//                       {updates.map((task) => (
//                         <div
//                           key={task._id}
//                           className="rounded-lg border p-3 text-sm"
//                         >
//                           <div className="flex items-center justify-between">
//                             <span className="font-medium">{task.title}</span>
//                             <span className="text-xs text-muted-foreground">{task.status}</span>
//                           </div>
//                           <p className="text-xs text-muted-foreground mt-1">
//                             {task.internName || 'Unknown intern'}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//       )}
//     </DashboardLayout>
//   );
// };

// export default ProjectManagement;















import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
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
  const [selectedInternsToAdd, setSelectedInternsToAdd] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddInternsModal, setShowAddInternsModal] = useState(false);

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
    try {
      const data = await projectService.getAll();
      console.log('Loaded projects:', data);
      setProjects(data);
      if (!selectedProjectId && data.length) {
        setSelectedProjectId(data[0]._id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
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
      console.error('Failed to load interns:', error);
      setInterns([]);
    }
  };

  const loadUpdates = async (projectId: string) => {
    try {
      const data = await projectService.getUpdates(projectId, 10);
      setUpdates(data);
    } catch (error) {
      console.error('Failed to load updates:', error);
      setUpdates([]);
    }
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
    
    // Validation
    if (!newProject.name?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Project name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!newProject.mentor?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Mentor is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!newProject.startDate) {
      toast({
        title: 'Validation Error',
        description: 'Start date is required.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const projectData: any = {
        name: newProject.name.trim(),
        mentor: newProject.mentor.trim(),
        startDate: newProject.startDate,
      };

      if (newProject.description?.trim()) {
        projectData.description = newProject.description.trim();
      }

      if (newProject.endDate) {
        projectData.endDate = newProject.endDate;
      }

      if (newProject.techStack?.trim()) {
        projectData.techStack = newProject.techStack
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }

      console.log('Creating project with data:', projectData);

      const createdProject = await projectService.create(projectData);
      
      console.log('Project created successfully:', createdProject);

      setNewProject({
        name: '',
        description: '',
        mentor: '',
        startDate: '',
        endDate: '',
        techStack: '',
      });

      setShowCreateModal(false);
      
      toast({
        title: 'Success',
        description: 'Project created successfully.',
      });
      
      await loadProjects();

    } catch (error: any) {
      console.error('Create project error:', error);
      
      let errorMessage = 'Failed to create project. Please try again.';
      
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Create failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignInterns = async () => {
    if (!selectedProject || selectedInternsToAdd.length === 0) return;
    
    setSubmitting(true);
    
    try {
      const updated = await projectService.assignInterns(selectedProject._id, selectedInternsToAdd);
      setProjects((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );
      setSelectedInternsToAdd([]);
      setShowAddInternsModal(false);
      
      if (showViewModal) {
        setSelectedProjectId(updated._id);
      }
      
      toast({
        title: 'Success',
        description: `${selectedInternsToAdd.length} intern(s) assigned successfully.`,
      });
    } catch (error: any) {
      console.error('Assignment error:', error);
      toast({
        title: 'Assignment failed',
        description: error?.response?.data?.detail || error?.message || 'Failed to assign interns',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAddInternsModal = (project: Project) => {
    setSelectedProjectId(project._id);
    setSelectedInternsToAdd([]);
    setShowAddInternsModal(true);
  };

  const handleToggleInternSelection = (internId: string) => {
    setSelectedInternsToAdd(prev => {
      if (prev.includes(internId)) {
        return prev.filter(id => id !== internId);
      } else {
        return [...prev, internId];
      }
    });
  };

  const assignedInternNames = useMemo(() => {
    if (!selectedProject) return [];
    const internIds = selectedProject.internIds || [];
    return internIds
      .map((id) => interns.find((intern) => intern._id === id))
      .filter(Boolean)
      .map((intern) => intern?.name || 'Unknown');
  }, [selectedProject, interns]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <DashboardLayout>
      {loading && (
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {/* Header with Create Button */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Project Management</h1>
              <p className="text-muted-foreground">Add projects, assign interns, and track updates.</p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)} 
              className="bg-[#1a1a2e] hover:bg-[#2a2a3e]"
              disabled={submitting}
            >
              Create Project
            </Button>
          </div>

          {/* Create Project Modal */}
          {showCreateModal && (
            <div 
              style={styles.modalOverlay} 
              onClick={() => !submitting && setShowCreateModal(false)}
            >
              <div 
                style={styles.modalContent} 
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.modalHeader}>
                  <h2 style={styles.modalTitle}>Add Project</h2>
                  <button 
                    style={styles.btnClose} 
                    onClick={() => setShowCreateModal(false)}
                    type="button"
                    disabled={submitting}
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleCreateProject} style={styles.form}>
                  <div style={styles.formGrid}>
                    <Input
                      placeholder="Project name"
                      value={newProject.name}
                      onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      disabled={submitting}
                    />
                    <Input
                      placeholder="Mentor"
                      value={newProject.mentor}
                      onChange={(e) => setNewProject((prev) => ({ ...prev, mentor: e.target.value }))}
                      required
                      disabled={submitting}
                    />
                    <Input
                      type="date"
                      placeholder="Start Date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject((prev) => ({ ...prev, startDate: e.target.value }))}
                      required
                      disabled={submitting}
                    />
                    <Input
                      type="date"
                      placeholder="End Date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject((prev) => ({ ...prev, endDate: e.target.value }))}
                      disabled={submitting}
                    />
                    <div style={styles.formGroupFullWidth}>
                      <Input
                        placeholder="Tech stack (comma separated)"
                        value={newProject.techStack}
                        onChange={(e) => setNewProject((prev) => ({ ...prev, techStack: e.target.value }))}
                        disabled={submitting}
                      />
                    </div>
                    <div style={styles.formGroupFullWidth}>
                      <Textarea
                        placeholder="Description"
                        value={newProject.description}
                        onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#1a1a2e] hover:bg-[#2a2a3e]"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create Project'}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* View Project Modal */}
          {showViewModal && selectedProject && (
            <div 
              style={styles.modalOverlay} 
              onClick={() => setShowViewModal(false)}
            >
              <div 
                style={{...styles.modalContent, ...styles.modalView}} 
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.modalHeader}>
                  <h2 style={styles.modalTitle}>Project Details</h2>
                  <button 
                    style={styles.btnClose} 
                    onClick={() => setShowViewModal(false)}
                    type="button"
                  >
                    ×
                  </button>
                </div>
                
                <div style={styles.projectDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Project Name:</span>
                    <span style={styles.detailValue}>{selectedProject.name}</span>
                  </div>
                  
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Mentor:</span>
                    <span style={styles.detailValue}>{selectedProject.mentor}</span>
                  </div>
                  
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Start Date:</span>
                    <span style={styles.detailValue}>{formatDate(selectedProject.startDate)}</span>
                  </div>

                  {selectedProject.endDate && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>End Date:</span>
                      <span style={styles.detailValue}>{formatDate(selectedProject.endDate)}</span>
                    </div>
                  )}
                  
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Description:</span>
                    <span style={styles.detailValue}>{selectedProject.description || 'No description'}</span>
                  </div>
                  
                  {selectedProject.techStack && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Tech Stack:</span>
                      <span style={styles.detailValue}>
                        {Array.isArray(selectedProject.techStack) 
                          ? selectedProject.techStack.join(', ') 
                          : selectedProject.techStack}
                      </span>
                    </div>
                  )}
                  
                  <div style={styles.detailSection}>
                    <div style={styles.sectionHeader}>
                      <h3 style={styles.sectionTitle}>Assigned Interns</h3>
                      <Button 
                        onClick={() => handleOpenAddInternsModal(selectedProject)}
                        size="sm"
                        className="bg-[#1a1a2e] hover:bg-[#2a2a3e]"
                      >
                        Add Interns
                      </Button>
                    </div>
                    <div style={styles.internsList}>
                      {assignedInternNames.length > 0 ? (
                        assignedInternNames.map((name, index) => (
                          <span key={index} style={styles.internChip}>
                            {name}
                          </span>
                        ))
                      ) : (
                        <p style={styles.emptyState}>No interns assigned yet</p>
                      )}
                    </div>
                  </div>

                  <div style={styles.detailSection}>
                    <h3 style={styles.sectionTitle}>Tasks Claimed by Interns</h3>
                    <div style={styles.tasksList}>
                      {updates && updates.length > 0 ? (
                        updates.map((task) => (
                          <div key={task._id} style={styles.taskItem}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{task.title}</span>
                              <span className="text-xs text-muted-foreground">{task.status}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.internName || 'Unknown intern'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p style={styles.emptyState}>No tasks claimed yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Interns Modal */}
          {showAddInternsModal && selectedProject && (
            <div 
              style={styles.modalOverlay} 
              onClick={() => !submitting && setShowAddInternsModal(false)}
            >
              <div 
                style={styles.modalContent} 
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.modalHeader}>
                  <h2 style={styles.modalTitle}>Add Interns to {selectedProject.name}</h2>
                  <button 
                    style={styles.btnClose} 
                    onClick={() => setShowAddInternsModal(false)}
                    type="button"
                    disabled={submitting}
                  >
                    ×
                  </button>
                </div>
                
                <div style={styles.internsSelection}>
                  <p style={styles.selectionInstruction}>Select interns to assign to this project:</p>
                  <div style={styles.internsGrid}>
                    {interns.map((intern) => {
                      const isAlreadyAssigned = (selectedProject.internIds || []).includes(intern._id);
                      const isSelected = selectedInternsToAdd.includes(intern._id);
                      
                      return (
                        <div
                          key={intern._id}
                          style={{
                            ...styles.internSelectCard,
                            ...(isSelected ? styles.internSelectCardSelected : {}),
                            ...(isAlreadyAssigned ? styles.internSelectCardDisabled : {})
                          }}
                          onClick={() => !isAlreadyAssigned && !submitting && handleToggleInternSelection(intern._id)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isAlreadyAssigned || submitting}
                            readOnly
                            style={styles.checkbox}
                          />
                          <span>{intern.name}</span>
                          {isAlreadyAssigned && (
                            <span style={styles.badgeAssigned}>Already Assigned</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={styles.modalActions}>
                    <Button 
                      variant="outline"
                      onClick={() => setShowAddInternsModal(false)}
                      type="button"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAssignInterns}
                      disabled={selectedInternsToAdd.length === 0 || submitting}
                      className="bg-[#1a1a2e] hover:bg-[#2a2a3e]"
                      type="button"
                    >
                      {submitting ? 'Assigning...' : `Assign ${selectedInternsToAdd.length > 0 ? `(${selectedInternsToAdd.length})` : ''}`}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects Section */}
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="rounded-xl border p-4 transition-shadow hover:shadow-md"
                  style={{
                    borderColor: selectedProjectId === project._id ? '#1a1a2e' : '#e5e7eb',
                  }}
                >
                  <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                  
                  <div className="space-y-1 text-sm text-muted-foreground mb-2">
                    <p>Mentor: {project.mentor}</p>
                    <p>Start: {formatDate(project.startDate)}</p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {project.description || 'No description'}
                  </p>
                  
                  <div className="text-xs text-muted-foreground mb-4">
                    Interns: {(project.internIds || []).length}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-[#1a1a2e] hover:bg-[#2a2a3e]"
                      onClick={() => {
                        setSelectedProjectId(project._id);
                        setShowViewModal(true);
                      }}
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleOpenAddInternsModal(project)}
                    >
                      Add Interns
                    </Button>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-sm text-muted-foreground col-span-2">No projects created yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

// Inline Styles for Modals
const styles: { [key: string]: React.CSSProperties } = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  modalView: {
    maxWidth: '700px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#1a1a2e',
    margin: 0,
  },
  btnClose: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    color: '#6b7280',
    cursor: 'pointer',
    padding: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
  form: {
    padding: '1.5rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  formGroupFullWidth: {
    gridColumn: '1 / -1',
  },
  projectDetails: {
    padding: '1.5rem',
  },
  detailRow: {
    display: 'flex',
    padding: '1rem 0',
    borderBottom: '1px solid #e5e7eb',
  },
  detailLabel: {
    fontWeight: 600,
    color: '#374151',
    minWidth: '140px',
    flexShrink: 0,
  },
  detailValue: {
    color: '#1a1a2e',
    flex: 1,
  },
  detailSection: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '2px solid #e5e7eb',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1a1a2e',
    margin: 0,
  },
  internsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  internChip: {
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  taskItem: {
    padding: '0.75rem',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    borderLeft: '3px solid #1a1a2e',
  },
  emptyState: {
    color: '#9ca3af',
    fontStyle: 'italic',
    padding: '1rem 0',
  },
  internsSelection: {
    padding: '1.5rem',
  },
  selectionInstruction: {
    color: '#6b7280',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
  },
  internsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '0.5rem',
  },
  internSelectCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
  },
  internSelectCardSelected: {
    borderColor: '#1a1a2e',
    backgroundColor: '#f0f0f5',
  },
  internSelectCardDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: '#f9fafb',
  },
  checkbox: {
    cursor: 'pointer',
  },
  badgeAssigned: {
    fontSize: '0.7rem',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    marginLeft: 'auto',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
};

export default ProjectManagement;