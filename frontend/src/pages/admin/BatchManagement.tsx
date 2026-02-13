// src/pages/admin/BatchManagement.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, UserPlus, Eye, Layers, X, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { batchService } from '@/services/batchService';
import apiClient from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Batch {
  _id: string;
  batchId: string;
  batchName: string;
  startDate: string;
  endDate: string;
  coordinator: string;
  description?: string;
  totalInterns: number;
  activeInterns: number;
  status: string;
  averageTaskCompletion: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  batch?: string;
}

const BatchManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Batch Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [coordinator, setCoordinator] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Add Interns Modal State
  const [showAddInternsModal, setShowAddInternsModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingInterns, setAddingInterns] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await batchService.getAll();
      setBatches(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load batches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!batchName || !startDate || !coordinator) {
      toast({
        title: 'Missing fields',
        description: 'Batch name, start date, and coordinator are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);
      await batchService.create({
        batchName,
        startDate,
        coordinator,
        description: description || undefined,
      });

      toast({
        title: 'Batch created',
        description: `Batch "${batchName}" created successfully!`,
      });
      
      // Reset form and close modal
      setBatchName('');
      setStartDate('');
      setCoordinator('');
      setDescription('');
      setShowCreateModal(false);
      
      // Refresh batches
      fetchBatches();
    } catch (error: any) {
      const errorMsg = typeof error?.response?.data?.detail === 'string'
        ? error.response.data.detail
        : Array.isArray(error?.response?.data?.detail)
        ? error.response.data.detail.map((e: any) => e.msg || e).join(', ')
        : 'Failed to create batch';
      
      toast({
        title: 'Create failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const openAddInternsModal = async (batchId: string) => {
    setSelectedBatchId(batchId);
    setShowAddInternsModal(true);
    setSearchQuery('');
    setSelectedUsers([]);
    
    try {
      const response = await apiClient.get('/admin/users');
      // Handle paginated response
      const data = response.data.items || response.data;
      const available = data.filter(
        (user: User) => !user.batch && (user.role === 'intern' || user.role === 'scrum_master')
      );
      setAvailableUsers(available);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load available users',
        variant: 'destructive',
      });
    }
  };

  const handleAddInterns = async () => {
    if (!selectedBatchId || selectedUsers.length === 0) {
      toast({
        title: 'No users selected',
        description: 'Please select at least one user to add.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAddingInterns(true);
      await batchService.addUsersToBatch(selectedBatchId, selectedUsers);
      
      toast({
        title: 'Success',
        description: `${selectedUsers.length} user(s) added to batch successfully!`,
      });
      
      setShowAddInternsModal(false);
      setSelectedUsers([]);
      fetchBatches();
    } catch (error: any) {
      const errorMsg = typeof error?.response?.data?.detail === 'string'
        ? error.response.data.detail
        : Array.isArray(error?.response?.data?.detail)
        ? error.response.data.detail.map((e: any) => e.msg || e).join(', ')
        : 'Failed to add users to batch';
      
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setAddingInterns(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
      active: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      archived: 'bg-[#8686AC]/20 text-[#272757] border-[#8686AC]/40',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="border-b">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Batch Management</h1>
            <p className="text-muted-foreground">Manage intern batches and cohorts</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Batch
          </Button>
        </div>

        {/* Batches Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => (
            <Card key={batch._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{batch.batchName}</CardTitle>
                    <Badge className={getStatusColor(batch.status)}>{batch.status}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(batch.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    Coordinator: {batch.coordinator}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openAddInternsModal(batch.batchId)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Interns
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/admin/batches/${batch._id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Batch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {batches.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Layers className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No batches found</h3>
              <p className="text-muted-foreground mb-4">Create your first batch to get started</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Batch
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Batch Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
              <DialogDescription>Fill in the batch details below. Batch ID will be auto-generated.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <Input
                  placeholder="Batch name *"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Start Date *</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Input
                  placeholder="Coordinator name *"
                  value={coordinator}
                  onChange={(e) => setCoordinator(e.target.value)}
                  required
                />
              </div>

              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Batch'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Interns Modal */}
        <Dialog open={showAddInternsModal} onOpenChange={setShowAddInternsModal}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Add Interns to Batch</DialogTitle>
              <DialogDescription>Select interns or scrum masters to add to this batch.</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No available users found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="p-3 flex items-center gap-3 hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleUserSelection(user._id)}
                      >
                        <Checkbox
                          checked={selectedUsers.includes(user._id)}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => toggleUserSelection(user._id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedUsers.length} user(s) selected
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedUsers([])}
                  >
                    Clear
                  </Button>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddInternsModal(false)}
                  disabled={addingInterns}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddInterns}
                  disabled={addingInterns || selectedUsers.length === 0}
                >
                  {addingInterns ? 'Adding...' : 'Add to Batch'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default BatchManagement;
