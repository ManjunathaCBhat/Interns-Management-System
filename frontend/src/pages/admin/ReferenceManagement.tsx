import React, { useEffect, useState } from 'react';
import { Download, Search as SearchIcon, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import PageLoader from '@/components/shared/PageLoader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

const performanceOptions = [
  { value: 'not-assessed', label: 'Not Assessed', color: '#d9d9d9' },
  { value: 'poor', label: 'Poor', color: '#ff4d4f' },
  { value: 'fair', label: 'Fair', color: '#faad14' },
  { value: 'good', label: 'Good', color: '#52c41a' },
  { value: 'excellent', label: 'Excellent', color: '#1890ff' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

interface ReferenceIntern {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  referredBy?: string;
  status: 'active' | 'inactive' | 'pending';
  performance: string;
  comments?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  referredBy: string;
  status: 'active' | 'inactive' | 'pending';
  performance: string;
  comments: string;
}

const ReferenceManagement: React.FC = () => {
  const [data, setData] = useState<ReferenceIntern[]>([]);
  const [filteredData, setFilteredData] = useState<ReferenceIntern[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReference, setSelectedReference] = useState<ReferenceIntern | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    referredBy: '',
    status: 'pending',
    performance: 'not-assessed',
    comments: '',
  });

  const fetchReferences = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/references');
      const references = res.data.items || res.data || [];
      setData(references);
      setFilteredData(references);
    } catch (error: any) {
      console.error('Error fetching references:', error);
      toast.error(error.response?.data?.detail || 'Failed to fetch references');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferences();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    const v = value.toLowerCase();
    if (!v) {
      setFilteredData(data);
      return;
    }

    setFilteredData(
      data.filter(
        (i) =>
          i.name.toLowerCase().includes(v) ||
          i.email.toLowerCase().includes(v) ||
          (i.referredBy && i.referredBy.toLowerCase().includes(v))
      )
    );
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      referredBy: '',
      status: 'pending',
      performance: 'not-assessed',
      comments: '',
    });
  };

  const handleAddReference = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are required');
      return;
    }

    try {
      await apiClient.post('/admin/references', formData);
      toast.success('Reference added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      fetchReferences();
    } catch (error: any) {
      console.error('Error adding reference:', error);
      toast.error(error.response?.data?.detail || 'Failed to add reference');
    }
  };

  const handleViewClick = (reference: ReferenceIntern) => {
    setSelectedReference(reference);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (reference: ReferenceIntern) => {
    setSelectedReference(reference);
    setFormData({
      name: reference.name,
      email: reference.email,
      phone: reference.phone || '',
      referredBy: reference.referredBy || '',
      status: reference.status,
      performance: reference.performance,
      comments: reference.comments || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateReference = async () => {
    if (!selectedReference) return;

    try {
      await apiClient.patch(`/admin/references/${selectedReference._id}`, formData);
      toast.success('Reference updated successfully');
      setIsEditDialogOpen(false);
      setSelectedReference(null);
      resetForm();
      fetchReferences();
    } catch (error: any) {
      console.error('Error updating reference:', error);
      toast.error(error.response?.data?.detail || 'Failed to update reference');
    }
  };

  const handleDeleteClick = (reference: ReferenceIntern) => {
    setSelectedReference(reference);
    setDeleteConfirmText('');
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteReference = async () => {
    if (!selectedReference) return;

    // Validate confirmation text
    if (deleteConfirmText.toLowerCase() !== selectedReference.name.toLowerCase()) {
      toast.error('Confirmation text does not match. Please type the exact name.');
      return;
    }

    try {
      await apiClient.delete(`/admin/references/${selectedReference._id}`);
      toast.success('Reference deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedReference(null);
      setDeleteConfirmText('');
      fetchReferences();
    } catch (error: any) {
      console.error('Error deleting reference:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete reference');
    }
  };

  const handleQuickUpdate = async (id: string, field: string, value: string) => {
    try {
      await apiClient.patch(`/admin/references/${id}`, { [field]: value });
      toast.success('Updated successfully');
      fetchReferences();
    } catch (error: any) {
      console.error('Error updating reference:', error);
      toast.error(error.response?.data?.detail || 'Failed to update');
    }
  };

  const exportCSV = () => {
    const headers = [
      'Sl.No',
      'Name',
      'Email',
      'Referred By',
      'Status',
      'Test/Interview Performance',
    ];

    const rows = data.map((d, i) => [
      i + 1,
      d.name,
      d.email,
      d.referredBy || '-',
      d.status,
      performanceOptions.find((p) => p.value === d.performance)?.label || d.performance,
    ]);

    const csv =
      headers.join(',') +
      '\n' +
      rows.map((r) => r.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `reference_sheet_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isDeleteConfirmValid = selectedReference 
    ? deleteConfirmText.toLowerCase() === selectedReference.name.toLowerCase()
    : false;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reference Sheet</h1>
            <p className="text-muted-foreground mt-1">
              Manage intern references and interview performance tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Reference
            </Button>
            <Button onClick={exportCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or referrer"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <PageLoader message="Loading references..." />
            ) : filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  {search ? 'No references found matching your search' : 'No reference data found'}
                </p>
                {!search && (
                  <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Reference
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Sl.No</th>
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">Referred By</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Test/Interview Performance</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((intern, index) => (
                      <tr key={intern._id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{intern.name}</td>
                        <td className="py-3 px-4 text-sm">{intern.email}</td>
                        <td className="py-3 px-4 text-sm">{intern.referredBy || '-'}</td>
                        <td className="py-3 px-4">
                          <Select
                            value={intern.status}
                            onValueChange={(val) =>
                              handleQuickUpdate(intern._id, 'status', val)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={intern.performance}
                            onValueChange={(val) =>
                              handleQuickUpdate(intern._id, 'performance', val)
                            }
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {performanceOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <span style={{ color: option.color }}>
                                    ● {option.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewClick(intern)}
                              className="h-8 w-8 p-0"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditClick(intern)}
                              className="h-8 w-8 p-0"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(intern)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
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

        {/* Pagination Info */}
        {filteredData.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredData.length} of {data.length} records
          </div>
        )}

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Reference Details</DialogTitle>
              <DialogDescription>
                Complete information for this reference
              </DialogDescription>
            </DialogHeader>
            {selectedReference && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-semibold text-sm text-muted-foreground">Name:</div>
                  <div className="col-span-2 text-sm">{selectedReference.name}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-semibold text-sm text-muted-foreground">Email:</div>
                  <div className="col-span-2 text-sm">{selectedReference.email}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-semibold text-sm text-muted-foreground">Phone:</div>
                  <div className="col-span-2 text-sm">{selectedReference.phone || '-'}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-semibold text-sm text-muted-foreground">Referred By:</div>
                  <div className="col-span-2 text-sm">{selectedReference.referredBy || '-'}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-semibold text-sm text-muted-foreground">Status:</div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      selectedReference.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedReference.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedReference.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-semibold text-sm text-muted-foreground">Performance:</div>
                  <div className="col-span-2">
                    <span style={{ 
                      color: performanceOptions.find(p => p.value === selectedReference.performance)?.color 
                    }}>
                      ● {performanceOptions.find(p => p.value === selectedReference.performance)?.label || selectedReference.performance}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-semibold text-sm text-muted-foreground">Comments:</div>
                  <div className="col-span-2 text-sm">{selectedReference.comments || '-'}</div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Reference Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Reference</DialogTitle>
              <DialogDescription>
                Add a new intern reference entry to the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referredBy">Referred By</Label>
                  <Input
                    id="referredBy"
                    value={formData.referredBy}
                    onChange={(e) => handleInputChange('referredBy', e.target.value)}
                    placeholder="Referrer name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => handleInputChange('status', val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="performance">Performance</Label>
                  <Select
                    value={formData.performance}
                    onValueChange={(val) => handleInputChange('performance', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {performanceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span style={{ color: option.color }}>
                            ● {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  placeholder="Add any relevant comments or notes"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddReference}>Add Reference</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Reference Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Reference</DialogTitle>
              <DialogDescription>
                Update reference information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-referredBy">Referred By</Label>
                  <Input
                    id="edit-referredBy"
                    value={formData.referredBy}
                    onChange={(e) => handleInputChange('referredBy', e.target.value)}
                    placeholder="Referrer name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => handleInputChange('status', val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-performance">Performance</Label>
                  <Select
                    value={formData.performance}
                    onValueChange={(val) => handleInputChange('performance', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {performanceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span style={{ color: option.color }}>
                            ● {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-comments">Comments</Label>
                <Textarea
                  id="edit-comments"
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  placeholder="Add any relevant comments or notes"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedReference(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateReference}>Update Reference</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="relative h-5 w-5">
                    <div className="absolute inset-0 rounded-full border-2 border-red-600"></div>
                    <svg className="absolute inset-0 h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                Drop Reference?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  Are you sure you want to drop reference "{selectedReference?.name}"?
                </p>
                <div className="space-y-2">
                  <Label htmlFor="delete-confirm" className="text-sm font-medium text-foreground">
                    Type "{selectedReference?.name}" to confirm your action
                  </Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="border-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedReference(null);
                setDeleteConfirmText('');
              }}>
                Cancel
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDeleteReference}
                disabled={!isDeleteConfirmValid}
              >
                Drop Reference
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default ReferenceManagement;