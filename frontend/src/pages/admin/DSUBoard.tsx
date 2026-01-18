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

// src/pages/admin/DSUBoard.tsx
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
  MessageSquare,
  FileText,
  TrendingUp,
  ArrowLeft,
  X,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { dsuService } from '@/services/dsuService';
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
import { Input } from '@/components/ui/input';
import Avatar from '@/components/shared/Avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DSUEntry {
  _id: string;
  internId: string;
  internName?: string;
  batch?: string;
  date: string;
  yesterday: string;
  today: string;
  blockers?: string;
  learnings?: string;
  status: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

interface Intern {
  _id: string;
  name: string;
  email: string;
  domain: string;
  batch?: string;
  currentProject?: string;
  status: string;
}

const DSUBoard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [dsus, setDsus] = useState<DSUEntry[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDSU, setSelectedDSU] = useState<DSUEntry | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dsusData, internsData] = await Promise.all([
        dsuService.getAll({
          date_from: selectedDate,
          date_to: selectedDate,
        }),
        internService.getAll({ status: 'active' }),
      ]);

      // Handle both array and paginated response
      const internsList = Array.isArray(internsData) ? internsData : internsData.items || [];

      setDsus(dsusData);
      setInterns(internsList);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load DSU entries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeedback = async () => {
    if (!selectedDSU || !feedback.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter feedback',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingFeedback(true);
      await dsuService.addFeedback(selectedDSU._id, feedback);
      toast({
        title: 'Success',
        description: `Feedback added for ${selectedDSU.internName}`,
      });
      setSelectedDSU(null);
      setFeedback('');
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to add feedback',
        variant: 'destructive',
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Filter DSUs
  const filteredDsus = dsus.filter((dsu) => {
    const matchesStatus = statusFilter === 'all' || dsu.status === statusFilter;
    const matchesBatch = batchFilter === 'all' || dsu.batch === batchFilter;
    const matchesSearch =
      !searchQuery ||
      dsu.internName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesBatch && matchesSearch;
  });

  // Get unique batches
  const uniqueBatches = Array.from(new Set(dsus.map((d) => d.batch).filter(Boolean)));

  // Get interns who haven't submitted
  const submittedInternIds = new Set(dsus.map((d) => d.internId));
  const notSubmittedInterns = interns.filter((i) => !submittedInternIds.has(i._id));

  // Calculate stats
  const stats = {
    totalInterns: interns.length,
    submitted: dsus.length,
    pending: interns.length - dsus.length,
    reviewed: dsus.filter((d) => d.status === 'reviewed').length,
    withBlockers: dsus.filter((d) => d.blockers && d.blockers.trim()).length,
    completionRate: interns.length > 0 ? Math.round((dsus.length / interns.length) * 100) : 0,
  };

  const exportToCSV = () => {
    const headers = [
      'Intern',
      'Batch',
      'Date',
      'Yesterday',
      'Today',
      'Blockers',
      'Learnings',
      'Status',
      'Feedback',
      'Submitted At',
    ];

    const rows = filteredDsus.map((dsu) => [
      dsu.internName || 'Unknown',
      dsu.batch || '',
      dsu.date,
      dsu.yesterday,
      dsu.today,
      dsu.blockers || '',
      dsu.learnings || '',
      dsu.status,
      dsu.feedback || '',
      dsu.submittedAt || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsu-report-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'DSU report exported successfully',
    });
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setBatchFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'all' || batchFilter !== 'all' || searchQuery;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-muted-foreground">Loading DSU entries...</p>
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
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={fetchData} variant="outline" size="icon" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={exportToCSV} variant="outline" disabled={filteredDsus.length === 0}>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.reviewed}</p>
                  <p className="text-xs text-muted-foreground">Reviewed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.withBlockers}</p>
                  <p className="text-xs text-muted-foreground">Blockers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/20">
                  <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search intern..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Batch</label>
                <Select value={batchFilter} onValueChange={setBatchFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Batches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {uniqueBatches.map((batch) => (
                      <SelectItem key={batch} value={batch!}>
                        {batch}
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
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Not Submitted Interns Alert */}
        {notSubmittedInterns.length > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                {notSubmittedInterns.length} intern{notSubmittedInterns.length > 1 ? 's' : ''}{' '}
                haven't submitted DSU yet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {notSubmittedInterns.slice(0, 10).map((intern) => (
                  <Badge
                    key={intern._id}
                    variant="outline"
                    className="gap-1 cursor-pointer hover:bg-orange-100"
                    onClick={() => navigate(`/admin/interns/${intern._id}`)}
                  >
                    {intern.name}
                  </Badge>
                ))}
                {notSubmittedInterns.length > 10 && (
                  <Badge variant="outline">+{notSubmittedInterns.length - 10} more</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* DSU Entries */}
        <div className="space-y-4">
          {filteredDsus.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No DSU entries found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || hasActiveFilters
                    ? 'Try adjusting your search or filters'
                    : selectedDate === new Date().toISOString().split('T')[0]
                    ? 'No interns have submitted their daily standup yet.'
                    : 'No DSU submissions for this date.'}
                </p>
                <div className="flex gap-2 justify-center">
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Go to Today
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredDsus.map((dsu) => (
              <Card key={dsu._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={dsu.internName || 'Unknown'} size="sm" />
                      <div>
                        <h3 className="font-semibold">{dsu.internName || 'Unknown Intern'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {dsu.batch && `${dsu.batch} • `}
                          {new Date(dsu.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {dsu.blockers && dsu.blockers.trim() && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Has Blockers
                        </Badge>
                      )}
                      <Badge variant={dsu.status === 'reviewed' ? 'default' : 'secondary'}>
                        {dsu.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                      ✅ What I did yesterday:
                    </h4>
                    <p className="text-sm">{dsu.yesterday}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                      📝 What I'll do today:
                    </h4>
                    <p className="text-sm">{dsu.today}</p>
                  </div>
                  {dsu.blockers && dsu.blockers.trim() && (
                    <div>
                      <h4 className="text-sm font-semibold text-orange-600 mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Blockers:
                      </h4>
                      <p className="text-sm bg-orange-50 dark:bg-orange-900/20 p-3 rounded border border-orange-200 dark:border-orange-800">
                        {dsu.blockers}
                      </p>
                    </div>
                  )}
                  {dsu.learnings && dsu.learnings.trim() && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                        💡 Learnings:
                      </h4>
                      <p className="text-sm">{dsu.learnings}</p>
                    </div>
                  )}
                  {dsu.feedback && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-600 mb-1 flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        Feedback {dsu.reviewedBy && `from ${dsu.reviewedBy}`}:
                      </h4>
                      <p className="text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
                        {dsu.feedback}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Submitted{' '}
                      {dsu.submittedAt
                        ? new Date(dsu.submittedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : 'recently'}
                    </p>
                    {dsu.status === 'submitted' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDSU(dsu);
                          setFeedback('');
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Feedback
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Results Summary */}
        {filteredDsus.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing <span className="font-medium text-foreground">{filteredDsus.length}</span> of{' '}
              <span className="font-medium text-foreground">{dsus.length}</span> DSU entries
            </p>
          </div>
        )}

        {/* Feedback Modal */}
        {selectedDSU && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader className="border-b">
                <CardTitle>Add Feedback for {selectedDSU.internName}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
                  <p>
                    <strong>Yesterday:</strong> {selectedDSU.yesterday}
                  </p>
                  <p>
                    <strong>Today:</strong> {selectedDSU.today}
                  </p>
                  {selectedDSU.blockers && (
                    <p className="text-orange-600">
                      <strong>Blockers:</strong> {selectedDSU.blockers}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Feedback</label>
                  <textarea
                    className="w-full min-h-[120px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter your feedback..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDSU(null);
                      setFeedback('');
                    }}
                    disabled={submittingFeedback}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddFeedback} disabled={submittingFeedback}>
                    {submittingFeedback ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DSUBoard;
