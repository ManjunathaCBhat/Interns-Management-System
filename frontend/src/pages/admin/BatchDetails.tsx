import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft, 
  Plus, 
  X,
  Search,
  Calendar,
  UserCheck,
  Trash2,
  Loader2
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { batchService } from '@/services/batchService';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  batch?: string;
  employee_id?: string;
}

interface BatchInfo {
  _id: string;
  batchId: string;
  batchName: string;
  startDate: string;
  endDate: string;
  coordinator: string;
  description?: string;
  status: string;
  internIds: string[];
  totalInterns: number;
  activeInterns: number;
}

const BatchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [batch, setBatch] = useState<BatchInfo | null>(null);
  const [batchMembers, setBatchMembers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadBatchDetails();
  }, [id]);

  const loadBatchDetails = async () => {
    try {
      setLoading(true);
      const batchData = await batchService.getById(id!);
      setBatch(batchData as any);
      
      // Load batch members
      const members = await batchService.getInterns(batchData.batchId);
      setBatchMembers(members);
      
      // Load available users (not in any batch)
      const allUsers = await apiClient.get('/admin/users');
      // Handle paginated response
      const userData = allUsers.data.items || allUsers.data;
      const available = userData.filter(
        (user: User) => !user.batch && (user.role === 'intern' || user.role === 'scrum_master')
      );
      setAvailableUsers(available);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load batch details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUsers = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No users selected',
        description: 'Please select at least one user to add',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);
      const result = await batchService.addUsersToBatch(batch!.batchId, selectedUsers);
      
      toast({
        title: 'Users added',
        description: `Successfully added ${result.added.length} users to the batch`,
      });
      
      setShowAddModal(false);
      setSelectedUsers([]);
      setSearchQuery('');
      loadBatchDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to add users',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!confirm(`Remove ${userName} from this batch?`)) return;

    try {
      setProcessing(true);
      await batchService.removeUserFromBatch(batch!.batchId, userId);
      
      toast({
        title: 'User removed',
        description: `${userName} has been removed from the batch`,
      });
      
      loadBatchDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove user',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const filteredAvailableUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'intern':
        return 'bg-green-100 text-green-700';
      case 'scrum_master':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!batch) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Batch not found</h2>
          <Button onClick={() => navigate('/admin/batches')}>
            Back to Batches
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/batches')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{batch.batchName}</h1>
              <p className="text-muted-foreground">{batch.batchId}</p>
            </div>
            <Badge>{batch.status}</Badge>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Members
          </Button>
        </div>

        {/* Batch Info */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">{batchMembers.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Coordinator</p>
                  <p className="text-lg font-semibold">{batch.coordinator}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(batch.startDate).toLocaleDateString()}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(batch.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {batch.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{batch.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Members ({batchMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {batchMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground mb-4">No members in this batch yet</p>
                <Button variant="outline" onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Members
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {batchMembers.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveUser(member._id, member.name)}
                        disabled={processing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Members Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Add Members to Batch</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedUsers([]);
                      setSearchQuery('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {selectedUsers.length} user(s) selected
                  </p>

                  {filteredAvailableUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                      <p className="text-muted-foreground">No available users found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAvailableUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                            selectedUsers.includes(user.id) ? 'bg-primary/10 border-primary' : ''
                          }`}
                          onClick={() => toggleUserSelection(user.id)}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="h-4 w-4"
                            />
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="border-t p-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUsers([]);
                    setSearchQuery('');
                  }}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddUsers} disabled={processing || selectedUsers.length === 0}>
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add {selectedUsers.length} User(s)
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BatchDetails;
