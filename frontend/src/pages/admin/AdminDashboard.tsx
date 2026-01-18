// // src/pages/admin/AdminDashboard.tsx
// import React, { useState, useEffect } from 'react';
// import {
//   Users,
//   CheckCircle,
//   Clock,
//   TrendingUp,
//   Calendar,
//   AlertTriangle,
//   Briefcase,
//   FileText,
//   Download,
//   ArrowRight,
//   Activity,
// } from 'lucide-react';
// import DashboardLayout from '@/components/layout/DashboardLayout';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import StatCard from '@/components/shared/StatCard';
// import StatusBadge from '@/components/shared/StatusBadge';
// import Avatar from '@/components/shared/Avatar';
// import { useNavigate } from 'react-router-dom';
// import { internService } from '@/services/internService';
// import { taskService } from '@/services/taskService';
// import { dsuService } from '@/services/dsuService';
// import { ptoService } from '@/services/ptoService';
// import { useToast } from '@/hooks/use-toast';

// const AdminDashboard: React.FC = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const { toast } = useToast();
  
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     totalInterns: 0,
//     activeInterns: 0,
//     projectInterns: 0,
//     rsInterns: 0,
//     paidInterns: 0,
//     totalTasks: 0,
//     completedTasks: 0,
//     submittedDSUs: 0,
//     pendingPTOs: 0,
//     dsuCompletion: 0,
//   });
  
//   const [recentInterns, setRecentInterns] = useState<any[]>([]);
//   const [todaysDSUs, setTodaysDSUs] = useState<any[]>([]);
//   const [pendingPTOs, setPendingPTOs] = useState<any[]>([]);
//   const [blockedInterns, setBlockedInterns] = useState<any[]>([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const today = new Date().toISOString().split('T')[0];
      
//       // Fetch all data in parallel
//       const [internsData, tasksData, dsuData, ptoData] = await Promise.all([
//         internService.getAll(),
//         taskService.getAll(),
//         dsuService.getAll(),
//         ptoService.getAll({ status: 'pending' }),
//       ]);

//       // Calculate stats
//       const activeInterns = internsData.filter((i: any) => i.status === 'active');
//       const projectInterns = internsData.filter((i: any) => i.internType === 'project').length;
//       const rsInterns = internsData.filter((i: any) => i.internType === 'rs').length;
//       const paidInterns = internsData.filter((i: any) => i.isPaid).length;
//       const completedTasks = tasksData.filter((t: any) => t.status === 'DONE').length;
      
//       const todayDSUs = dsuData.filter((d: any) => d.date === today);
//       const submittedDSUs = todayDSUs.filter((d: any) => d.status === 'submitted').length;
//       const dsuCompletion = activeInterns.length > 0 
//         ? Math.round((submittedDSUs / activeInterns.length) * 100) 
//         : 0;

//       const blocked = todayDSUs.filter((d: any) => d.blockers && d.blockers.trim() !== '');

//       setStats({
//         totalInterns: internsData.length,
//         activeInterns: activeInterns.length,
//         projectInterns,
//         rsInterns,
//         paidInterns,
//         totalTasks: tasksData.length,
//         completedTasks,
//         submittedDSUs,
//         pendingPTOs: ptoData.length,
//         dsuCompletion,
//       });

//       setRecentInterns(internsData.slice(0, 5));
//       setTodaysDSUs(todayDSUs.slice(0, 5));
//       setPendingPTOs(ptoData.slice(0, 5));
//       setBlockedInterns(blocked.slice(0, 3));
      
//     } catch (error) {
//       console.error('Failed to load dashboard data:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to load dashboard data',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApprovePTO = async (ptoId: string) => {
//     try {
//       await ptoService.update(ptoId, { status: 'approved' });
//       toast({ title: 'PTO Request Approved' });
//       fetchDashboardData();
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to approve PTO',
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleRejectPTO = async (ptoId: string) => {
//     try {
//       await ptoService.update(ptoId, { status: 'rejected' });
//       toast({ title: 'PTO Request Rejected' });
//       fetchDashboardData();
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to reject PTO',
//         variant: 'destructive',
//       });
//     }
//   };

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
//               Admin Dashboard
//             </h1>
//             <p className="text-muted-foreground">
//               Welcome back, {user?.name?.split(' ')[0]}. Here's what's happening today.
//             </p>
//           </div>
//           <Button variant="accent" onClick={() => navigate('/admin/interns')}>
//             Manage Interns
//             <ArrowRight className="ml-2 h-4 w-4" />
//           </Button>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           <StatCard
//             title="Total Interns"
//             value={stats.totalInterns}
//             subtitle={`${stats.activeInterns} active`}
//             icon={Users}
//           />
//           <StatCard
//             title="Project / RS"
//             value={`${stats.projectInterns} / ${stats.rsInterns}`}
//             subtitle="Intern types"
//             icon={Briefcase}
//           />
//           <StatCard
//             title="Tasks Completed"
//             value={`${stats.completedTasks}/${stats.totalTasks}`}
//             subtitle={stats.totalTasks > 0 ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` : '0%'}
//             icon={CheckCircle}
//           />
//           <StatCard
//             title="DSU Completion"
//             value={`${stats.dsuCompletion}%`}
//             subtitle="Today"
//             icon={FileText}
//             iconClassName={stats.dsuCompletion < 80 ? 'bg-warning/10' : undefined}
//           />
//         </div>

//         {/* DSU Status + Blocked Interns */}
//         <div className="grid gap-6 lg:grid-cols-2">
//           <Card>
//             <CardHeader className="flex-row items-center justify-between">
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 <Calendar className="h-5 w-5 text-accent" />
//                 Today's DSU Status
//               </CardTitle>
//               <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dsu-board')}>
//                 View Board
//                 <ArrowRight className="ml-1 h-4 w-4" />
//               </Button>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-3 gap-4 text-center">
//                 <div className="rounded-lg bg-success-light p-3">
//                   <p className="text-2xl font-bold text-success">{stats.submittedDSUs}</p>
//                   <p className="text-xs text-muted-foreground">Submitted</p>
//                 </div>
//                 <div className="rounded-lg bg-warning-light p-3">
//                   <p className="text-2xl font-bold text-warning">
//                     {stats.activeInterns - stats.submittedDSUs}
//                   </p>
//                   <p className="text-xs text-muted-foreground">Pending</p>
//                 </div>
//                 <div className="rounded-lg bg-error-light p-3">
//                   <p className="text-2xl font-bold text-error">{blockedInterns.length}</p>
//                   <p className="text-xs text-muted-foreground">Blocked</p>
//                 </div>
//               </div>

//               {blockedInterns.length > 0 && (
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium flex items-center gap-2">
//                     <AlertTriangle className="h-4 w-4 text-warning" />
//                     Interns with Blockers
//                   </p>
//                   <div className="space-y-2">
//                     {blockedInterns.map((dsu: any) => {
//                       const intern = recentInterns.find((i: any) => i._id === dsu.internId);
//                       return (
//                         <div
//                           key={dsu._id}
//                           className="flex items-start gap-3 rounded-lg bg-warning-light/50 p-3 text-sm"
//                         >
//                           <Avatar name={intern?.name || 'Unknown'} size="sm" />
//                           <div className="flex-1 min-w-0">
//                             <p className="font-medium">{intern?.name || 'Unknown'}</p>
//                             <p className="text-muted-foreground truncate">{dsu.blockers}</p>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Pending PTO Requests */}
//           <Card>
//             <CardHeader className="flex-row items-center justify-between">
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 <Calendar className="h-5 w-5 text-accent" />
//                 Pending PTO Requests
//               </CardTitle>
//               <Button variant="ghost" size="sm" onClick={() => navigate('/admin/pto')}>
//                 View All
//                 <ArrowRight className="ml-1 h-4 w-4" />
//               </Button>
//             </CardHeader>
//             <CardContent className="p-0">
//               {pendingPTOs.length === 0 ? (
//                 <div className="p-6 text-center text-muted-foreground">
//                   No pending PTO requests
//                 </div>
//               ) : (
//                 <div className="divide-y">
//                   {pendingPTOs.map((pto: any) => (
//                     <div
//                       key={pto._id}
//                       className="p-4 hover:bg-muted/30 transition-colors"
//                     >
//                       <div className="flex items-center justify-between mb-2">
//                         <span className="font-medium">{pto.name}</span>
//                         <span className="text-sm text-muted-foreground">
//                           {pto.numberOfDays} day(s)
//                         </span>
//                       </div>
//                       <p className="text-sm text-muted-foreground mb-3">
//                         {pto.startDate} to {pto.endDate}
//                       </p>
//                       <div className="flex gap-2">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="text-green-600 flex-1"
//                           onClick={() => handleApprovePTO(pto._id)}
//                         >
//                           Approve
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="text-red-600 flex-1"
//                           onClick={() => handleRejectPTO(pto._id)}
//                         >
//                           Reject
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Recent Interns Table */}
//         <Card>
//           <CardHeader className="flex-row items-center justify-between">
//             <CardTitle className="text-lg">Recent Interns</CardTitle>
//             <Button variant="ghost" size="sm" onClick={() => navigate('/admin/interns')}>
//               View All
//               <ArrowRight className="ml-1 h-4 w-4" />
//             </Button>
//           </CardHeader>
//           <CardContent className="p-0">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="border-b bg-muted/30">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
//                       Intern
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
//                       Type
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
//                       Project
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
//                       Status
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
//                       Tasks
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y">
//                   {recentInterns.map((intern: any) => (
//                     <tr
//                       key={intern._id}
//                       className="hover:bg-muted/30 transition-colors cursor-pointer"
//                       onClick={() => navigate(`/admin/interns/${intern._id}`)}
//                     >
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-3">
//                           <Avatar name={intern.name} size="sm" />
//                           <div>
//                             <p className="font-medium">{intern.name}</p>
//                             <p className="text-sm text-muted-foreground">{intern.domain}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="text-sm uppercase font-medium">
//                           {intern.internType}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-sm">{intern.currentProject || 'N/A'}</td>
//                       <td className="px-4 py-3">
//                         <StatusBadge status={intern.status} />
//                       </td>
//                       <td className="px-4 py-3 text-sm">
//                         {intern.completedTasks}/{intern.taskCount}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Quick Actions */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-lg">Quick Actions</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
//               <Button
//                 variant="outline"
//                 className="justify-start h-auto py-4"
//                 onClick={() => navigate('/admin/interns')}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
//                     <Users className="h-5 w-5 text-blue-600" />
//                   </div>
//                   <div className="text-left">
//                     <p className="font-medium">Manage Interns</p>
//                     <p className="text-xs text-muted-foreground">View all interns</p>
//                   </div>
//                 </div>
//               </Button>

//               <Button
//                 variant="outline"
//                 className="justify-start h-auto py-4"
//                 onClick={() => navigate('/admin/dsu-board')}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
//                     <FileText className="h-5 w-5 text-green-600" />
//                   </div>
//                   <div className="text-left">
//                     <p className="font-medium">Review DSUs</p>
//                     <p className="text-xs text-muted-foreground">Check submissions</p>
//                   </div>
//                 </div>
//               </Button>

//               <Button
//                 variant="outline"
//                 className="justify-start h-auto py-4"
//                 onClick={() => navigate('/admin/pto')}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
//                     <Calendar className="h-5 w-5 text-purple-600" />
//                   </div>
//                   <div className="text-left">
//                     <p className="font-medium">PTO Approvals</p>
//                     <p className="text-xs text-muted-foreground">Review requests</p>
//                   </div>
//                 </div>
//               </Button>

//               <Button
//                 variant="outline"
//                 className="justify-start h-auto py-4"
//                 onClick={() => {/* TODO: Export functionality */}}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
//                     <Download className="h-5 w-5 text-orange-600" />
//                   </div>
//                   <div className="text-left">
//                     <p className="font-medium">Export Data</p>
//                     <p className="text-xs text-muted-foreground">Download reports</p>
//                   </div>
//                 </div>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default AdminDashboard;


// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  FileText,
  Briefcase,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Layers,
  RefreshCw,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import Avatar from '@/components/shared/Avatar';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalInterns: number;
  activeInterns: number;
  projectInterns: number;
  rsInterns: number;
  paidInterns: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletion: number;
  submittedDSUs: number;
  pendingDSUs: number;
  pendingPTOs: number;
  approvedPTOs: number;
  dsuCompletion: number;
  totalBatches: number;
  activeBatches: number;
  upcomingBatches: number;
}

interface RecentIntern {
  _id: string;
  name: string;
  email: string;
  batch?: string;
  internType: string;
  domain: string;
  status: string;
  completedTasks: number;
  taskCount: number;
  dsuStreak: number;
}

interface BlockedIntern {
  _id: string;
  internId: string;
  internName: string;
  internEmail: string;
  batch: string;
  blockers: string;
  date: string;
}

interface PendingPTO {
  _id: string;
  internId: string;
  internName: string;
  batch: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason?: string;
  leaveType: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalInterns: 0,
    activeInterns: 0,
    projectInterns: 0,
    rsInterns: 0,
    paidInterns: 0,
    totalTasks: 0,
    completedTasks: 0,
    taskCompletion: 0,
    submittedDSUs: 0,
    pendingDSUs: 0,
    pendingPTOs: 0,
    approvedPTOs: 0,
    dsuCompletion: 0,
    totalBatches: 0,
    activeBatches: 0,
    upcomingBatches: 0,
  });
  
  const [recentInterns, setRecentInterns] = useState<RecentIntern[]>([]);
  const [blockedInterns, setBlockedInterns] = useState<BlockedIntern[]>([]);
  const [pendingPTOs, setPendingPTOs] = useState<PendingPTO[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const [statsRes, internsRes, blockedRes, ptosRes] = await Promise.all([
        apiClient.get('/admin/dashboard/stats'),
        apiClient.get('/admin/dashboard/recent-interns?limit=5'),
        apiClient.get('/admin/dashboard/blocked-interns'),
        apiClient.get('/admin/dashboard/pending-ptos?limit=5'),
      ]);

      setStats(statsRes.data);
      setRecentInterns(internsRes.data);
      setBlockedInterns(blockedRes.data);
      setPendingPTOs(ptosRes.data);

      if (isRefresh) {
        toast({
          title: 'Dashboard Refreshed',
          description: 'All data has been updated',
        });
      }
      
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprovePTO = async (ptoId: string, internName: string) => {
    try {
      await apiClient.patch(`/pto/${ptoId}`, { status: 'approved' });
      toast({ 
        title: 'PTO Approved',
        description: `${internName}'s leave request has been approved`,
      });
      fetchDashboardData(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to approve PTO',
        variant: 'destructive',
      });
    }
  };

  const handleRejectPTO = async (ptoId: string, internName: string) => {
    try {
      await apiClient.patch(`/pto/${ptoId}`, { status: 'rejected' });
      toast({ 
        title: 'PTO Rejected',
        description: `${internName}'s leave request has been rejected`,
      });
      fetchDashboardData(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to reject PTO',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const taskCompletionRate = stats.taskCompletion || 
    (stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name?.split(' ')[0]}. Here's what's happening today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/batches')}>
              <Layers className="mr-2 h-4 w-4" />
              Batches
            </Button>
            <Button variant="accent" onClick={() => navigate('/admin/interns')}>
              Manage Interns
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Interns"
            value={stats.totalInterns}
            subtitle={`${stats.activeInterns} active`}
            icon={Users}
            trend={
              stats.totalInterns > 0
                ? {
                    value: Math.round((stats.activeInterns / stats.totalInterns) * 100),
                    isPositive: true,
                  }
                : undefined
            }
          />
          <StatCard
            title="Active Batches"
            value={`${stats.activeBatches}/${stats.totalBatches}`}
            subtitle={stats.upcomingBatches > 0 ? `${stats.upcomingBatches} upcoming` : 'No upcoming'}
            icon={Layers}
          />
          <StatCard
            title="Tasks Progress"
            value={`${stats.completedTasks}/${stats.totalTasks}`}
            subtitle={`${taskCompletionRate}% completion`}
            icon={CheckCircle}
            trend={
              taskCompletionRate > 0
                ? {
                    value: taskCompletionRate,
                    isPositive: taskCompletionRate >= 70,
                  }
                : undefined
            }
          />
          <StatCard
            title="DSU Completion"
            value={`${stats.dsuCompletion}%`}
            subtitle={`${stats.submittedDSUs}/${stats.activeInterns} submitted`}
            icon={FileText}
            iconClassName={stats.dsuCompletion < 80 ? 'bg-warning/10' : undefined}
            trend={
              stats.dsuCompletion > 0
                ? {
                    value: stats.dsuCompletion,
                    isPositive: stats.dsuCompletion >= 80,
                  }
                : undefined
            }
          />
        </div>

        {/* Breakdown Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Project Interns</p>
                  <p className="text-2xl font-bold">{stats.projectInterns}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalInterns > 0
                      ? `${Math.round((stats.projectInterns / stats.totalInterns) * 100)}%`
                      : '0%'}
                  </p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">RS Interns</p>
                  <p className="text-2xl font-bold">{stats.rsInterns}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalInterns > 0
                      ? `${Math.round((stats.rsInterns / stats.totalInterns) * 100)}%`
                      : '0%'}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid Interns</p>
                  <p className="text-2xl font-bold">{stats.paidInterns}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalInterns > 0
                      ? `${Math.round((stats.paidInterns / stats.totalInterns) * 100)}%`
                      : '0%'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending PTOs</p>
                  <p className="text-2xl font-bold">{stats.pendingPTOs}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.approvedPTOs} approved
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* DSU Status */}
          <Card>
            <CardHeader className="flex-row items-center justify-between border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-accent" />
                Today's DSU Status
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dsu-board')}>
                View Board
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.submittedDSUs}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Submitted</p>
                </div>
                <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4 border border-orange-200 dark:border-orange-800">
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.pendingDSUs}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Pending</p>
                </div>
              </div>

              {blockedInterns.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      Interns with Blockers
                    </p>
                    <span className="text-sm text-muted-foreground">
                      {blockedInterns.length} total
                    </span>
                  </div>
                  <div className="space-y-2">
                    {blockedInterns.slice(0, 3).map((dsu) => (
                      <div
                        key={dsu._id}
                        className="flex items-start gap-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 p-3 text-sm border border-orange-200 dark:border-orange-800 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                        onClick={() => navigate(`/admin/interns/${dsu.internId}`)}
                      >
                        <Avatar name={dsu.internName || 'Unknown'} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{dsu.internName}</p>
                            {dsu.batch && (
                              <span className="text-xs text-muted-foreground">
                                {dsu.batch}
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs line-clamp-2">
                            {dsu.blockers}
                          </p>
                        </div>
                      </div>
                    ))}
                    {blockedInterns.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate('/admin/dsu-board')}
                      >
                        View {blockedInterns.length - 3} more
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {blockedInterns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">No blockers reported today!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending PTO Requests */}
          <Card>
            <CardHeader className="flex-row items-center justify-between border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-accent" />
                Pending PTO Requests
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/pto')}>
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {pendingPTOs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending PTO requests</p>
                </div>
              ) : (
                <div className="divide-y">
                  {pendingPTOs.map((pto) => (
                    <div key={pto._id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar name={pto.internName} size="sm" />
                          <div>
                            <p className="font-medium">{pto.internName}</p>
                            {pto.batch && (
                              <p className="text-xs text-muted-foreground">{pto.batch}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">{pto.numberOfDays} day(s)</span>
                          <p className="text-xs text-muted-foreground capitalize">
                            {pto.leaveType || 'Leave'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {formatDate(pto.startDate)} - {formatDate(pto.endDate)}
                      </p>
                      {pto.reason && (
                        <p className="text-sm text-muted-foreground italic mb-3 line-clamp-2">
                          "{pto.reason}"
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-300 flex-1"
                          onClick={() => handleApprovePTO(pto._id, pto.internName)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-300 flex-1"
                          onClick={() => handleRejectPTO(pto._id, pto.internName)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Interns Table */}
        <Card>
          <CardHeader className="flex-row items-center justify-between border-b">
            <CardTitle className="text-lg">Recent Interns</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/interns')}>
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentInterns.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No interns found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Intern
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Batch
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Domain
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Progress
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Streak
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentInterns.map((intern) => (
                      <tr
                        key={intern._id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/interns/${intern._id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={intern.name} size="sm" />
                            <div>
                              <p className="font-medium">{intern.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {intern.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">
                            {intern.batch || (
                              <span className="text-muted-foreground">Not assigned</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm uppercase font-medium text-blue-600">
                            {intern.internType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm">{intern.domain}</span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={intern.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {intern.completedTasks}/{intern.taskCount}
                            </span>
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 transition-all"
                                style={{
                                  width: `${
                                    intern.taskCount > 0
                                      ? (intern.completedTasks / intern.taskCount) * 100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{intern.dsuStreak}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="justify-start h-auto py-4 hover:bg-purple-50 hover:border-purple-300 transition-all"
                onClick={() => navigate('/admin/batches')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Layers className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Manage Batches</p>
                    <p className="text-xs text-muted-foreground">Create & edit batches</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4 hover:bg-blue-50 hover:border-blue-300 transition-all"
                onClick={() => navigate('/admin/interns')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Manage Interns</p>
                    <p className="text-xs text-muted-foreground">View all interns</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4 hover:bg-green-50 hover:border-green-300 transition-all"
                onClick={() => navigate('/admin/dsu-board')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Review DSUs</p>
                    <p className="text-xs text-muted-foreground">Daily standups</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4 hover:bg-orange-50 hover:border-orange-300 transition-all"
                onClick={() => navigate('/admin/pto')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">PTO Approvals</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.pendingPTOs} pending
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
