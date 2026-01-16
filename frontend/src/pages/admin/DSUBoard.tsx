// import React, { useState } from 'react';
// import {
//   Calendar,
//   Filter,
//   MessageSquare,
//   AlertTriangle,
//   CheckCircle,
//   Clock,
//   Users,
//   RefreshCw,
// } from 'lucide-react';
// import DashboardLayout from '@/components/layout/DashboardLayout';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import StatusBadge from '@/components/shared/StatusBadge';
// import Avatar from '@/components/shared/Avatar';
// import { mockInterns, mockDSUEntries, mockProjects } from '@/data/mockData';

// const DSUBoard: React.FC = () => {
//   const [projectFilter, setProjectFilter] = useState<string>('all');
//   const [statusFilter, setStatusFilter] = useState<string>('all');

//   const today = new Date().toISOString().split('T')[0];
//   const activeInterns = mockInterns.filter((i) => i.status === 'active' || i.status === 'training');

//   const getDSUForIntern = (internId: string) => {
//     return mockDSUEntries.find(
//       (dsu) => dsu.internId === internId && dsu.date === today
//     );
//   };

//   const getStatusIndicator = (dsu: typeof mockDSUEntries[0] | undefined) => {
//     if (!dsu || dsu.status === 'pending') {
//       return { color: 'bg-warning', label: 'Pending' };
//     }
//     if (dsu.blockers && dsu.blockers.length > 0) {
//       return { color: 'bg-error', label: 'Blocked' };
//     }
//     return { color: 'bg-success', label: 'Submitted' };
//   };

//   const filteredInterns = activeInterns.filter((intern) => {
//     const dsu = getDSUForIntern(intern.id);
//     const status = getStatusIndicator(dsu);

//     const matchesProject =
//       projectFilter === 'all' || intern.projectId === projectFilter;
//     const matchesStatus =
//       statusFilter === 'all' ||
//       (statusFilter === 'submitted' && status.label === 'Submitted') ||
//       (statusFilter === 'pending' && status.label === 'Pending') ||
//       (statusFilter === 'blocked' && status.label === 'Blocked');

//     return matchesProject && matchesStatus;
//   });

//   const stats = {
//     submitted: activeInterns.filter((i) => {
//       const dsu = getDSUForIntern(i.id);
//       return dsu && dsu.status === 'submitted' && (!dsu.blockers || dsu.blockers.length === 0);
//     }).length,
//     pending: activeInterns.filter((i) => {
//       const dsu = getDSUForIntern(i.id);
//       return !dsu || dsu.status === 'pending';
//     }).length,
//     blocked: activeInterns.filter((i) => {
//       const dsu = getDSUForIntern(i.id);
//       return dsu && dsu.blockers && dsu.blockers.length > 0;
//     }).length,
//   };

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
//               DSU Board
//             </h1>
//             <p className="text-muted-foreground">
//               Daily Standup Updates for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
//             </p>
//           </div>
//           <Button variant="outline">
//             <RefreshCw className="mr-2 h-4 w-4" />
//             Refresh
//           </Button>
//         </div>

//         {/* Stats */}
//         <div className="grid gap-4 sm:grid-cols-3">
//           <Card className="border-l-4 border-l-success">
//             <CardContent className="p-4">
//               <div className="flex items-center gap-4">
//                 <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
//                   <CheckCircle className="h-6 w-6 text-success" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold">{stats.submitted}</p>
//                   <p className="text-sm text-muted-foreground">Submitted</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="border-l-4 border-l-warning">
//             <CardContent className="p-4">
//               <div className="flex items-center gap-4">
//                 <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
//                   <Clock className="h-6 w-6 text-warning" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold">{stats.pending}</p>
//                   <p className="text-sm text-muted-foreground">Pending</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="border-l-4 border-l-error">
//             <CardContent className="p-4">
//               <div className="flex items-center gap-4">
//                 <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error/10">
//                   <AlertTriangle className="h-6 w-6 text-error" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold">{stats.blocked}</p>
//                   <p className="text-sm text-muted-foreground">Blocked</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Filters */}
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex flex-wrap gap-4">
//               <Select value={projectFilter} onValueChange={setProjectFilter}>
//                 <SelectTrigger className="w-[180px]">
//                   <SelectValue placeholder="Filter by Project" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Projects</SelectItem>
//                   {mockProjects.map((project) => (
//                     <SelectItem key={project.id} value={project.id}>
//                       {project.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <Select value={statusFilter} onValueChange={setStatusFilter}>
//                 <SelectTrigger className="w-[180px]">
//                   <SelectValue placeholder="Filter by Status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Status</SelectItem>
//                   <SelectItem value="submitted">Submitted</SelectItem>
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="blocked">Blocked</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* DSU Grid */}
//         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//           {filteredInterns.map((intern) => {
//             const dsu = getDSUForIntern(intern.id);
//             const status = getStatusIndicator(dsu);

//             return (
//               <Card key={intern.id} className="overflow-hidden">
//                 <CardHeader className="border-b bg-muted/30 p-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <Avatar name={intern.name} size="md" />
//                       <div>
//                         <p className="font-medium">{intern.name}</p>
//                         <p className="text-sm text-muted-foreground">
//                           {intern.currentProject}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span
//                         className={`h-3 w-3 rounded-full ${status.color}`}
//                         title={status.label}
//                       />
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="p-4">
//                   {dsu && dsu.status === 'submitted' ? (
//                     <div className="space-y-3 text-sm">
//                       <div>
//                         <p className="font-medium text-muted-foreground mb-1">
//                           Yesterday
//                         </p>
//                         <p className="line-clamp-2">{dsu.yesterday}</p>
//                       </div>
//                       <div>
//                         <p className="font-medium text-muted-foreground mb-1">
//                           Today
//                         </p>
//                         <p className="line-clamp-2">{dsu.today}</p>
//                       </div>
//                       {dsu.blockers && (
//                         <div className="rounded-lg bg-error/10 p-2">
//                           <p className="font-medium text-error mb-1 flex items-center gap-1">
//                             <AlertTriangle className="h-4 w-4" />
//                             Blocker
//                           </p>
//                           <p className="text-error/80">{dsu.blockers}</p>
//                         </div>
//                       )}
//                       {dsu.mentorComment && (
//                         <div className="rounded-lg bg-accent/10 p-2 mt-2">
//                           <p className="font-medium text-accent mb-1 flex items-center gap-1">
//                             <MessageSquare className="h-4 w-4" />
//                             Mentor Feedback
//                           </p>
//                           <p className="text-muted-foreground">
//                             {dsu.mentorComment}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="flex flex-col items-center justify-center py-6 text-center">
//                       <Clock className="h-10 w-10 text-muted-foreground/50 mb-2" />
//                       <p className="text-muted-foreground">
//                         No DSU submitted yet
//                       </p>
//                       <Button variant="outline" size="sm" className="mt-3">
//                         Send Reminder
//                       </Button>
//                     </div>
//                   )}
//                 </CardContent>
//                 {dsu && dsu.status === 'submitted' && (
//                   <div className="border-t p-3 bg-muted/20">
//                     <div className="flex gap-2">
//                       <Button variant="outline" size="sm" className="flex-1">
//                         <MessageSquare className="mr-1 h-4 w-4" />
//                         Comment
//                       </Button>
//                       <Button variant="outline" size="sm">
//                         View Details
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </Card>
//             );
//           })}
//         </div>

//         {filteredInterns.length === 0 && (
//           <Card>
//             <CardContent className="flex flex-col items-center justify-center py-12">
//               <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
//               <h3 className="text-lg font-medium">No interns found</h3>
//               <p className="text-muted-foreground">
//                 Try adjusting your filters
//               </p>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default DSUBoard;

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Filter,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { taskService } from '@/services/taskService';
import { internService } from '@/services/internService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Avatar from '@/components/shared/Avatar';
import { Task, Intern } from '@/types/intern';

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  BLOCKED: 'bg-red-100 text-red-800',
  DONE: 'bg-green-100 text-green-800',
};

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  ON_HOLD: 'On Hold',
  IN_PROGRESS: 'In Progress',
  BLOCKED: 'Blocked',
  DONE: 'Done',
};

const DSUBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [internFilter, setInternFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, internsData] = await Promise.all([
        taskService.getAll(),
        internService.getAll('active'),
      ]);
      setTasks(tasksData);
      setInterns(internsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks by selected date and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesIntern = internFilter === 'all' || task.internId === internFilter;
    const taskDate = task.date;
    const matchesDate = taskDate === selectedDate;
    return matchesStatus && matchesIntern && matchesDate;
  });

  // Group tasks by intern
  const tasksByIntern = filteredTasks.reduce((acc, task) => {
    if (!acc[task.internId]) {
      acc[task.internId] = [];
    }
    acc[task.internId].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Calculate stats
  const stats = {
    totalInterns: interns.length,
    totalTasks: filteredTasks.length,
    completed: filteredTasks.filter(t => t.status === 'DONE' || t.status === 'completed').length,
    inProgress: filteredTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'in-progress').length,
    blocked: filteredTasks.filter(t => t.status === 'BLOCKED').length,
    submitted: Object.keys(tasksByIntern).length, // Interns who submitted
  };

  const exportToCSV = () => {
    const headers = ['Intern', 'Email', 'Task', 'Project', 'Status', 'Comments', 'Date'];
    const rows = filteredTasks.map(task => {
      const intern = interns.find(i => i._id === task.internId);
      return [
        intern?.name || 'Unknown',
        intern?.email || '',
        task.title,
        task.project,
        STATUS_LABELS[task.status] || task.status,
        task.description || task.comments || '',
        task.date || task.createdAt?.split('T')[0] || '',
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsu-report-${selectedDate}.csv`;
    a.click();
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
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Daily Standup Board
            </h1>
            <p className="text-muted-foreground mt-1">
              Track all interns' daily progress and updates
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalInterns}</p>
                  <p className="text-xs text-muted-foreground">Total Interns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.submitted}</p>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalTasks}</p>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.blocked}</p>
                  <p className="text-xs text-muted-foreground">Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Intern</label>
                <Select value={internFilter} onValueChange={setInternFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Interns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Interns</SelectItem>
                    {interns.map((intern) => (
                      <SelectItem key={intern._id} value={intern._id}>
                        {intern.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Intern */}
        <div className="space-y-4">
          {interns
            .filter(intern => {
              if (internFilter !== 'all' && intern._id !== internFilter) return false;
              return tasksByIntern[intern._id]?.length > 0;
            })
            .map((intern) => {
              const internTasks = tasksByIntern[intern._id] || [];
              
              return (
                <Card key={intern._id} className="overflow-hidden">
                  <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center gap-4">
                      <Avatar name={intern.name} size="md" />
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">
                          {intern.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {intern.domain} • {intern.currentProject || 'No project'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {internTasks.length} task{internTasks.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {internTasks.filter(t => t.status === 'DONE' || t.status === 'completed').length} completed
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/20">
                          <tr className="text-left text-xs font-medium text-muted-foreground">
                            <th className="p-3">Task</th>
                            <th className="p-3">Project</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Comments</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {internTasks.map((task) => (
                            <tr key={task._id} className="hover:bg-muted/30 transition">
                              <td className="p-3">
                                <div>
                                  <p className="font-medium text-sm">{task.title}</p>
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-sm">{task.project}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {STATUS_LABELS[task.status] || task.status}
                                </span>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground max-w-xs">
                                {task.comments || task.description || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

          {/* Empty State */}
          {filteredTasks.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No updates for this date</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedDate === new Date().toISOString().split('T')[0]
                    ? 'No interns have submitted their daily standup yet.'
                    : 'Try selecting a different date or adjust your filters.'}
                </p>
                <Button variant="outline" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Go to Today
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DSUBoard;
