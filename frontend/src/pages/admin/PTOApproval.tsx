// src/pages/admin/PTOApproval.tsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  X, 
  Search, 
  Download,
  Clock,
  Filter,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Avatar from '@/components/shared/Avatar';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PTO {
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

const PTOApproval: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [ptos, setPtos] = useState<PTO[]>([]);
  const [filteredPtos, setFilteredPtos] = useState<PTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedPTO, setSelectedPTO] = useState<PTO | null>(null);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPTOs();
  }, [filterStatus]);

  useEffect(() => {
    filterPTOs();
  }, [ptos, searchQuery]);

  const fetchPTOs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/pto/', {
        params: { status: filterStatus },
      });
      setPtos(response.data);
    } catch (error: any) {
      console.error('Failed to fetch PTOs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load PTO requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPTOs = () => {
    let filtered = ptos;

    if (searchQuery) {
      filtered = filtered.filter(
        (pto) =>
          pto.internName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pto.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pto.team.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPtos(filtered);
  };

  const handleApprove = async (id: string, name: string, withComments = false) => {
    try {
      setActionLoading(true);
      const payload: any = { status: 'approved' };
      
      if (withComments && comments.trim()) {
        payload.comments = comments;
      }

      await apiClient.patch(`/pto/${id}`, payload);
      
      toast({
        title: 'PTO Approved',
        description: `${name}'s leave request has been approved`,
      });
      
      setSelectedPTO(null);
      setComments('');
      fetchPTOs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to approve PTO',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string, name: string, withComments = false) => {
    try {
      setActionLoading(true);
      const payload: any = { status: 'rejected' };
      
      if (withComments && comments.trim()) {
        payload.comments = comments;
      }

      await apiClient.patch(`/pto/${id}`, payload);
      
      toast({
        title: 'PTO Rejected',
        description: `${name}'s leave request has been rejected`,
      });
      
      setSelectedPTO(null);
      setComments('');
      fetchPTOs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to reject PTO',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickAction = (action: 'approve' | 'reject', pto: PTO) => {
    setSelectedPTO(pto);
    setComments('');
    
    // You can add a confirmation dialog here
    if (action === 'approve') {
      handleApprove(pto._id, pto.internName, false);
    } else {
      handleReject(pto._id, pto.internName, false);
    }
  };

  const openCommentModal = (pto: PTO, action: 'approve' | 'reject') => {
    setSelectedPTO({ ...pto, status: action });
    setComments('');
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

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      casual: 'bg-blue-100 text-blue-700 border-blue-200',
      sick: 'bg-red-100 text-red-700 border-red-200',
      emergency: 'bg-orange-100 text-orange-700 border-orange-200',
      wfh: 'bg-teal-100 text-teal-700 border-teal-200',
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const stats = {
    total: ptos.length,
    pending: filterStatus === 'pending' ? ptos.length : 0,
    approved: filterStatus === 'approved' ? ptos.length : 0,
    rejected: filterStatus === 'rejected' ? ptos.length : 0,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-muted-foreground">Loading PTO requests...</p>
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
              PTO Approvals
            </h1>
            <p className="text-muted-foreground">Manage intern time-off requests</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={fetchPTOs}>
              <Clock className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className={filterStatus === 'pending' ? 'ring-2 ring-blue-500' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {filterStatus === 'pending' ? ptos.length : '-'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className={filterStatus === 'approved' ? 'ring-2 ring-green-500' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">
                    {filterStatus === 'approved' ? ptos.length : '-'}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className={filterStatus === 'rejected' ? 'ring-2 ring-red-500' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">
                    {filterStatus === 'rejected' ? ptos.length : '-'}
                  </p>
                </div>
                <X className="h-8 w-8 text-red-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('pending')}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Pending
                </Button>
                <Button
                  size="sm"
                  variant={filterStatus === 'approved' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('approved')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approved
                </Button>
                <Button
                  size="sm"
                  variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('rejected')}
                >
                  <X className="mr-2 h-4 w-4" />
                  Rejected
                </Button>
              </div>
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PTO List */}
        <div className="grid gap-4">
          {filteredPtos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <h3 className="text-lg font-semibold mb-2">No {filterStatus} PTO requests</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : `There are no ${filterStatus} requests at the moment`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPtos.map((pto) => (
              <Card key={pto._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  {/* Header */}
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

                  {/* Details */}
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

                  {/* Approval Info (for approved/rejected) */}
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

                  {/* Actions (for pending only) */}
                  {pto.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-300 dark:hover:bg-green-900/20"
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
                        className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-300 dark:hover:bg-red-900/20"
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

                  {/* Request Date */}
                  <p className="text-xs text-muted-foreground mt-3 text-right">
                    Requested on {formatDate(pto.created_at)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Comment Modal */}
        {selectedPTO && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader className="border-b">
                <CardTitle>
                  {selectedPTO.status === 'approve' ? 'Approve' : 'Reject'} PTO Request
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
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
                    className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a comment for the intern..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPTO(null);
                      setComments('');
                    }}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={selectedPTO.status === 'approve' ? 'default' : 'destructive'}
                    onClick={() => {
                      if (selectedPTO.status === 'approve') {
                        handleApprove(selectedPTO._id, selectedPTO.internName, true);
                      } else {
                        handleReject(selectedPTO._id, selectedPTO.internName, true);
                      }
                    }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
};

export default PTOApproval;
