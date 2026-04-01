import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Avatar from "@/components/shared/Avatar";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Clock, 
  Home, 
  Calendar,
  CheckCircle,
  X,
  Search,
  MessageSquare,
  UserCheck,
  UserX,
  Trash2,
  Loader2,
  Mail,
  BadgeCheck as BadgeCheckIcon,
  ArrowLeft
} from "lucide-react";
import { UserRole } from "@/types/intern";

interface PTOApproval {
  _id: string;
  internId: string;
  internName: string;
  email: string;
  team: string;
  batch?: string;
  type?: 'PTO' | 'WFH';
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason?: string;
  leaveType?: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  created_at: string;
}

interface UserApproval {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  employee_id?: string;
  role: UserRole;
  is_approved: boolean;
  is_active?: boolean;
  created_at?: string;
}

type ApprovalType = 'USER' | 'PTO' | 'WFH';

export default function AdminApprovals() {
  const [activeTab, setActiveTab] = useState<ApprovalType>('PTO');
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // PTO/WFH state
  const [ptoApprovals, setPtoApprovals] = useState<PTOApproval[]>([]);
  const [wfhApprovals, setWfhApprovals] = useState<PTOApproval[]>([]);
  const [ptoFilter, setPtoFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedPTO, setSelectedPTO] = useState<PTOApproval | null>(null);
  const [ptoComments, setPtoComments] = useState('');
  
  // User approval state
  const [userApprovals, setUserApprovals] = useState<UserApproval[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [selectedRole, setSelectedRole] = useState<Record<string, UserRole>>({});
  
  const { toast } = useToast();

  useEffect(() => {
    loadApprovals();
  }, [activeTab, ptoFilter, userFilter]);

  // ================= LOAD ALL APPROVALS =================
  const loadApprovals = async () => {
    setLoading(true);
    try {
      if (activeTab === 'PTO' || activeTab === 'WFH') {
        await loadPTOApprovals();
      } else if (activeTab === 'USER') {
        await loadUserApprovals();
      }
    } catch (error) {
      console.error('Failed to load approvals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load approvals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD PTO/WFH APPROVALS =================
  const loadPTOApprovals = async () => {
    try {
      const response = await apiClient.get('/pto/', {
        params: { status: ptoFilter },
      });
      
      // Handle paginated response - backend now returns {items: [], total, skip, limit}
      const data = response.data.items || response.data;
      
      // Separate PTO and WFH
      const ptoList = data.filter((item: PTOApproval) => item.type !== 'WFH');
      const wfhList = data.filter((item: PTOApproval) => item.type === 'WFH');
      
      setPtoApprovals(ptoList);
      setWfhApprovals(wfhList);
    } catch (error) {
      console.error('Failed to load PTO/WFH:', error);
    }
  };

  // ================= LOAD USER APPROVALS =================
  const loadUserApprovals = async () => {
    try {
      let data: UserApproval[];
      
      if (userFilter === 'pending') {
        const response = await apiClient.get('/admin/users/pending');
        // Handle paginated response
        data = response.data.items || response.data;
      } else {
        const response = await apiClient.get('/admin/users');
        // Handle paginated response
        data = response.data.items || response.data;
        
        if (userFilter === 'approved') {
          data = data.filter((u) => u.is_approved);
        }
      }
      
      setUserApprovals(data);
      
      // Initialize selected roles
      const roles: Record<string, UserRole> = {};
      data.forEach((u) => {
        roles[u.id] = u.role || 'intern';
      });
      setSelectedRole(roles);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  // ================= PTO/WFH HANDLERS =================
  const handlePTOApprove = async (id: string, name: string, withComments = false) => {
    try {
      setActionLoading(true);
      const payload: any = { status: 'approved' };
      
      if (withComments && ptoComments.trim()) {
        payload.comments = ptoComments;
      }

      await apiClient.patch(`/pto/${id}`, payload);
      
      toast({
        title: 'Request Approved',
        description: `${name}'s leave request has been approved`,
      });
      
      setSelectedPTO(null);
      setPtoComments('');
      loadPTOApprovals();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to approve request',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePTOReject = async (id: string, name: string, withComments = false) => {
    try {
      setActionLoading(true);
      const payload: any = { status: 'rejected' };
      
      if (withComments && ptoComments.trim()) {
        payload.comments = ptoComments;
      }

      await apiClient.patch(`/pto/${id}`, payload);
      
      toast({
        title: 'Request Rejected',
        description: `${name}'s leave request has been rejected`,
      });
      
      setSelectedPTO(null);
      setPtoComments('');
      loadPTOApprovals();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to reject request',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickAction = (action: 'approve' | 'reject', pto: PTOApproval) => {
    setSelectedPTO(pto);
    setPtoComments('');
    
    if (action === 'approve') {
      handlePTOApprove(pto._id, pto.internName, false);
    } else {
      handlePTOReject(pto._id, pto.internName, false);
    }
  };

  const openCommentModal = (pto: PTOApproval, action: 'approve' | 'reject') => {
    setSelectedPTO({ ...pto, status: action });
    setPtoComments('');
  };

  // ================= USER APPROVAL HANDLERS =================
  const handleUserApprove = async (userId: string) => {
    setProcessingId(userId);
    try {
      const role = selectedRole[userId] || 'intern';
      await apiClient.patch(`/admin/users/${userId}/approve`, { role });
      
      toast({
        title: 'User Approved',
        description: `User has been approved as ${role}`,
      });
      
      loadUserApprovals();
    } catch (error) {
      console.error('Failed to approve user:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve user',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleUserReject = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this user?')) return;

    setProcessingId(userId);
    try {
      await apiClient.patch(`/admin/users/${userId}/reject`);
      
      toast({
        title: 'User Rejected',
        description: 'User has been deactivated',
      });
      
      loadUserApprovals();
    } catch (error) {
      console.error('Failed to reject user:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject user',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    setProcessingId(userId);
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      
      toast({
        title: 'User Deleted',
        description: 'User has been permanently deleted',
      });
      
      loadUserApprovals();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setSelectedRole((prev) => ({ ...prev, [userId]: role }));

    const user = userApprovals.find((u) => u.id === userId);
    if (user?.is_approved) {
      setProcessingId(userId);
      try {
        await apiClient.patch(`/admin/users/${userId}/role`, { role });
        
        toast({
          title: 'Role Updated',
          description: `User role changed to ${role}`,
        });
        
        loadUserApprovals();
      } catch (error) {
        console.error('Failed to update role:', error);
        toast({
          title: 'Error',
          description: 'Failed to update role',
          variant: 'destructive',
        });
      } finally {
        setProcessingId(null);
      }
    }
  };

  // ================= FILTERING =================
  const getCurrentApprovals = () => {
    if (activeTab === 'PTO') return ptoApprovals;
    if (activeTab === 'WFH') return wfhApprovals;
    return [];
  };

  const filteredPTOApprovals = getCurrentApprovals().filter((a) => {
    if (!search) return true;
    return (
      a.internName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.team.toLowerCase().includes(search.toLowerCase())
    );
  });

  const filteredUserApprovals = userApprovals.filter((user) => {
    if (!search) return true;
    return (
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(search.toLowerCase())
    );
  });

  // ================= HELPER FUNCTIONS =================
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
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

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      casual: 'bg-blue-100 text-blue-700 border-blue-200',
      sick: 'bg-red-100 text-red-700 border-red-200',
      emergency: 'bg-orange-100 text-orange-700 border-orange-200',
      wfh: 'bg-teal-100 text-teal-700 border-teal-200',
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'scrum_master':
        return 'bg-blue-100 text-blue-700';
      case 'mentor':
        return 'bg-purple-100 text-purple-700';
      case 'intern':
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  // ================= STATS =================
  const ptoStats = {
    pending: ptoApprovals.filter(a => a.status === 'pending').length,
    approved: ptoApprovals.filter(a => a.status === 'approved').length,
    rejected: ptoApprovals.filter(a => a.status === 'rejected').length,
  };

  const wfhStats = {
    pending: wfhApprovals.filter(a => a.status === 'pending').length,
    approved: wfhApprovals.filter(a => a.status === 'approved').length,
    rejected: wfhApprovals.filter(a => a.status === 'rejected').length,
  };

  const userStats = {
    total: userApprovals.length,
    pending: userApprovals.filter(u => !u.is_approved && u.is_active !== false).length,
    approved: userApprovals.filter(u => u.is_approved).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-2">Approvals Management</h1>
          <p className="text-muted-foreground">Manage all PTO, WFH, and user approvals in one place</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${activeTab === 'USER' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveTab('USER')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-blue-500" />
                <Badge variant="secondary">{userStats.pending} pending</Badge>
              </div>
              <h3 className="font-semibold text-lg">User Approvals</h3>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Total: {userStats.total}</p>
                <p>Approved: {userStats.approved}</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${activeTab === 'PTO' ? 'ring-2 ring-orange-500' : ''}`}
            onClick={() => setActiveTab('PTO')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-orange-500" />
                <Badge variant="secondary">{ptoStats.pending} pending</Badge>
              </div>
              <h3 className="font-semibold text-lg">PTO Requests</h3>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Approved: {ptoStats.approved}</p>
                <p>Rejected: {ptoStats.rejected}</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${activeTab === 'WFH' ? 'ring-2 ring-teal-500' : ''}`}
            onClick={() => setActiveTab('WFH')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Home className="h-8 w-8 text-teal-500" />
                <Badge variant="secondary">{wfhStats.pending} pending</Badge>
              </div>
              <h3 className="font-semibold text-lg">WFH Requests</h3>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Approved: {wfhStats.approved}</p>
                <p>Rejected: {wfhStats.rejected}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {activeTab === 'USER' ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={userFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setUserFilter('all')}
                  >
                    All Users
                  </Button>
                  <Button
                    size="sm"
                    variant={userFilter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setUserFilter('pending')}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Pending
                  </Button>
                  <Button
                    size="sm"
                    variant={userFilter === 'approved' ? 'default' : 'outline'}
                    onClick={() => setUserFilter('approved')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approved
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={ptoFilter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setPtoFilter('pending')}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Pending
                  </Button>
                  <Button
                    size="sm"
                    variant={ptoFilter === 'approved' ? 'default' : 'outline'}
                    onClick={() => setPtoFilter('approved')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approved
                  </Button>
                  <Button
                    size="sm"
                    variant={ptoFilter === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setPtoFilter('rejected')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Rejected
                  </Button>
                </div>
              )}
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={activeTab === 'USER' ? 'Search by name, email, or employee ID...' : 'Search by name, email, or team...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading approvals...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* USER APPROVALS */}
            {activeTab === 'USER' && (
              <Card>
                <CardContent className="p-0">
                  {filteredUserApprovals.length === 0 ? (
                    <div className="py-12 text-center">
                      <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                      <h3 className="text-lg font-semibold mb-2">No users found</h3>
                      <p className="text-sm text-muted-foreground">
                        {search ? 'Try adjusting your search query' : `There are no ${userFilter} users at the moment`}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Employee ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Joined</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredUserApprovals.map((user) => (
                            <tr key={user.id} className="hover:bg-muted/30">
                              <td className="px-4 py-4">
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Mail size={12} />
                                    {user.email}
                                  </p>
                                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm">{user.employee_id || '-'}</span>
                              </td>
                              <td className="px-4 py-4">
                                {user.is_active === false ? (
                                  <Badge variant="destructive">Deactivated</Badge>
                                ) : user.is_approved ? (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <select
                                  value={selectedRole[user.id] || user.role}
                                  onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                  disabled={processingId === user.id}
                                  className={`px-2 py-1 text-sm rounded-lg border ${getRoleBadgeColor(selectedRole[user.id] || user.role)}`}
                                >
                                  <option value="intern">Intern</option>
                                  <option value="scrum_master">Scrum Master</option>
                                  <option value="mentor">Mentor</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar size={12} />
                                  {formatDate(user.created_at)}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  {!user.is_approved && user.is_active !== false && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUserApprove(user.id)}
                                        disabled={processingId === user.id}
                                        className="text-green-600 hover:bg-green-50"
                                      >
                                        {processingId === user.id ? (
                                          <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                          <UserCheck size={16} />
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUserReject(user.id)}
                                        disabled={processingId === user.id}
                                        className="text-red-600 hover:bg-red-50"
                                      >
                                        <UserX size={16} />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUserDelete(user.id)}
                                    disabled={processingId === user.id}
                                    className="text-gray-600 hover:bg-gray-50"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
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
            )}

            {/* PTO/WFH APPROVALS */}
            {(activeTab === 'PTO' || activeTab === 'WFH') && (
              <div className="grid gap-4">
                {filteredPTOApprovals.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                      <h3 className="text-lg font-semibold mb-2">No {ptoFilter} {activeTab} requests</h3>
                      <p className="text-sm text-muted-foreground">
                        {search
                          ? 'Try adjusting your search query'
                          : `There are no ${ptoFilter} requests at the moment`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredPTOApprovals.map((pto) => (
                    <Card key={pto._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={pto.internName} size="sm" />
                            <div>
                              <h3 className="font-semibold text-lg">{pto.internName}</h3>
                              <p className="text-sm text-muted-foreground">{pto.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {pto.batch && (
                                  <Badge variant="outline" className="text-xs">
                                    {pto.batch}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {pto.team}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Badge className={getLeaveTypeColor(pto.type === 'WFH' ? 'wfh' : (pto.leaveType || 'casual'))}>
                            {pto.type === 'WFH' ? 'WFH' : (pto.leaveType || 'PTO')}
                          </Badge>
                        </div>

                        <div className="space-y-3 mb-4 p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Duration:</span>
                            </div>
                            <span className="text-sm font-semibold">
                              {pto.numberOfDays} day{pto.numberOfDays > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">From:</span>
                            <span className="font-medium">{formatDate(pto.startDate)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">To:</span>
                            <span className="font-medium">{formatDate(pto.endDate)}</span>
                          </div>
                          {pto.reason && (
                            <div className="pt-2 border-t">
                              <p className="text-sm text-muted-foreground mb-1">Reason:</p>
                              <p className="text-sm italic">"{pto.reason}"</p>
                            </div>
                          )}
                        </div>

                        {(pto.status === 'approved' || pto.status === 'rejected') && (
                          <div className="mb-4 p-3 rounded-lg bg-muted/50 border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                {pto.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                              </span>
                              {pto.approvedBy && (
                                <span className="text-sm text-muted-foreground">
                                  by {pto.approvedBy}
                                </span>
                              )}
                            </div>
                            {pto.comments && (
                              <p className="text-sm text-muted-foreground italic">
                                "{pto.comments}"
                              </p>
                            )}
                            {pto.approvedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(pto.approvedAt)}
                              </p>
                            )}
                          </div>
                        )}

                        {pto.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-300"
                              onClick={() => handleQuickAction('approve', pto)}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCommentModal(pto, 'approve')}
                              disabled={actionLoading}
                              title="Approve with comment"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-300"
                              onClick={() => handleQuickAction('reject', pto)}
                              disabled={actionLoading}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCommentModal(pto, 'reject')}
                              disabled={actionLoading}
                              title="Reject with comment"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground mt-3 text-right">
                          Requested on {formatDate(pto.created_at)}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Comment Modal for PTO/WFH */}
        {selectedPTO && selectedPTO.status && (selectedPTO.status === 'approve' || selectedPTO.status === 'reject') && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold">
                  {selectedPTO.status === 'approve' ? 'Approve' : 'Reject'} {activeTab} Request
                </h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{selectedPTO.internName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedPTO.startDate)} - {formatDate(selectedPTO.endDate)} (
                    {selectedPTO.numberOfDays} days)
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Add Comment (Optional)
                  </label>
                  <textarea
                    className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Add a comment for the intern..."
                    value={ptoComments}
                    onChange={(e) => setPtoComments(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPTO(null);
                      setPtoComments('');
                    }}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={selectedPTO.status === 'approve' ? 'default' : 'destructive'}
                    onClick={() => {
                      if (selectedPTO.status === 'approve') {
                        handlePTOApprove(selectedPTO._id, selectedPTO.internName, true);
                      } else {
                        handlePTOReject(selectedPTO._id, selectedPTO.internName, true);
                      }
                    }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Processing...
                      </>
                    ) : selectedPTO.status === 'approve' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Reject
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
}