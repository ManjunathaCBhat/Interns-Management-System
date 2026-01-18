// src/pages/admin/InternManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Users,
  TrendingUp,
  Briefcase,
  Award,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/shared/StatusBadge';
import Avatar from '@/components/shared/Avatar';
import { internService } from '@/services/internService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Intern {
  _id: string;
  name: string;
  email: string;
  phone: string;
  domain: string;
  internType: string;
  batch?: string;
  status: string;
  currentProject?: string;
  mentor: string;
  taskCount: number;
  completedTasks: number;
  dsuStreak: number;
  isPaid: boolean;
  college: string;
  cgpa: number;
}

const InternManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.internType = typeFilter;
      if (batchFilter !== 'all') params.batch = batchFilter;

      const data = await internService.getAll(params);
      
      // Handle both array and paginated response
      const internsList = Array.isArray(data) ? data : data.items || [];
      setInterns(internsList);
    } catch (error: any) {
      console.error('Failed to fetch interns:', error);
      toast({
        title: 'Error',
        description: 'Failed to load interns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await internService.delete(id);
      toast({ 
        title: 'Success',
        description: `${name} has been deleted successfully` 
      });
      setInterns(interns.filter((i) => i._id !== id));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete intern',
        variant: 'destructive',
      });
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'College',
      'Domain',
      'Type',
      'Batch',
      'Status',
      'Project',
      'Mentor',
      'CGPA',
      'Tasks',
      'Completed',
      'DSU Streak',
      'Paid',
    ];

    const rows = filteredInterns.map((intern) => [
      intern.name,
      intern.email,
      intern.phone,
      intern.college,
      intern.domain,
      intern.internType,
      intern.batch || '',
      intern.status,
      intern.currentProject || '',
      intern.mentor,
      intern.cgpa,
      intern.taskCount,
      intern.completedTasks,
      intern.dsuStreak,
      intern.isPaid ? 'Yes' : 'No',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interns-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredInterns = interns.filter((intern) => {
    const matchesSearch =
      intern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intern.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intern.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intern.college.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || intern.status === statusFilter;
    const matchesType = typeFilter === 'all' || intern.internType === typeFilter;
    const matchesBatch = batchFilter === 'all' || intern.batch === batchFilter;

    return matchesSearch && matchesStatus && matchesType && matchesBatch;
  });

  // Get unique batches
  const uniqueBatches = Array.from(new Set(interns.map((i) => i.batch).filter(Boolean)));

  // Calculate stats
  const stats = {
    total: interns.length,
    active: interns.filter((i) => i.status === 'active').length,
    project: interns.filter((i) => i.internType === 'project').length,
    rs: interns.filter((i) => i.internType === 'rs').length,
    paid: interns.filter((i) => i.isPaid).length,
    avgCompletion: interns.length > 0
      ? Math.round(
          (interns.reduce((sum, i) => 
            sum + (i.taskCount > 0 ? (i.completedTasks / i.taskCount) * 100 : 0), 0
          ) / interns.length)
        )
      : 0,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-muted-foreground">Loading interns...</p>
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
              Intern Management
            </h1>
            <p className="text-muted-foreground">
              Manage all interns, their projects, and status
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" onClick={fetchInterns}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="default" onClick={() => navigate('/admin/interns/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Intern
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
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.project}</p>
                  <p className="text-xs text-muted-foreground">Project</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.rs}</p>
                  <p className="text-xs text-muted-foreground">RS</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.paid}</p>
                  <p className="text-xs text-muted-foreground">Paid</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgCompletion}%</p>
                  <p className="text-xs text-muted-foreground">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, domain, or college..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                <Select value={batchFilter} onValueChange={setBatchFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Batch" />
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

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="rs">RS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interns Table */}
        <Card>
          <CardContent className="p-0">
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
                      Project
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
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInterns.map((intern) => (
                    <tr
                      key={intern._id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/interns/${intern._id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={intern.name} size="sm" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{intern.name}</p>
                              {intern.isPaid && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Paid
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{intern.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {intern.batch ? (
                          <Badge variant="outline">{intern.batch}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${
                            intern.internType === 'rs'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {intern.internType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{intern.domain}</td>
                      <td className="px-4 py-3 text-sm">
                        {intern.currentProject || (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={intern.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${
                                  intern.taskCount > 0
                                    ? (intern.completedTasks / intern.taskCount) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {intern.completedTasks}/{intern.taskCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800">
                          🔥 {intern.dsuStreak}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => navigate(`/admin/interns/${intern._id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate(`/admin/interns/${intern._id}/edit`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(intern._id, intern.name)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Intern
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredInterns.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <UserPlus className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No interns found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first intern'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/admin/interns/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Intern
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Footer */}
        {filteredInterns.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing <span className="font-medium text-foreground">{filteredInterns.length}</span> of{' '}
              <span className="font-medium text-foreground">{interns.length}</span> interns
            </p>
            {(statusFilter !== 'all' || typeFilter !== 'all' || batchFilter !== 'all' || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setBatchFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InternManagement;
