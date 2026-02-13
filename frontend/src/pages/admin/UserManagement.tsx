import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  MoreVertical,
  Trash2,
  RefreshCw,
  Users,
  Shield,
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'scrum_master' | 'user';
  is_active: boolean;
}

const UserManagement: React.FC = () => {
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'user',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/users');
      // Handle both paginated and non-paginated responses
      const userData = res.data.items || res.data;
      setUsers(userData);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete ${user.name}? This will deactivate the user.`)) return;

    try {
      await apiClient.delete(`/admin/users/${user._id}`);
      toast({ title: 'User deleted successfully' });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Delete failed',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/role`, { role });
      toast({ title: 'Role updated successfully' });
      fetchUsers();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleCreateUser = async () => {
    try {
      setCreating(true);
      await apiClient.post('/admin/users', formData);
      toast({ title: 'User created successfully' });
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'user',
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage admins, scrum masters, and interns
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="scrum_master">Scrum Master</SelectItem>
                <SelectItem value="user">Intern</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-6 w-40" />
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 text-left">User</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </td>

                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(user._id, 'admin')}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(user._id, 'scrum_master')
                                }
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Make Scrum Master
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(user._id, 'user')}
                              >
                                Intern
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(user)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="p-10 text-center text-muted-foreground">
                    No users found
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Add New User</h2>

            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Input
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="scrum_master">Scrum Master</SelectItem>
                <SelectItem value="user">Intern</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={creating}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserManagement;