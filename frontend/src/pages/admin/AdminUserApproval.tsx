import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Shield,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Mail,
  Calendar,
  BadgeCheck,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/UserService";
import { User, UserRole } from "@/types/intern";
import DashboardLayout from "@/components/layout/DashboardLayout";

const AdminUserApproval: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Record<string, UserRole>>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let data: User[];
      if (filter === "pending") {
        data = await userService.getPending();
      } else {
        data = await userService.getAll();
      }

      // Filter approved if needed
      if (filter === "approved") {
        data = data.filter((u) => u.is_approved);
      }

      setUsers(data);

      // Initialize selected roles
      const roles: Record<string, UserRole> = {};
      data.forEach((u) => {
        roles[u.id] = u.role || "intern";
      });
      setSelectedRole(roles);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    try {
      const role = selectedRole[userId] || "intern";
      await userService.approveUser(userId, role);
      toast({
        title: "User Approved",
        description: `User has been approved as ${role}`,
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to approve user:", error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Are you sure you want to reject this user?")) return;

    setProcessingId(userId);
    try {
      await userService.rejectUser(userId);
      toast({
        title: "User Rejected",
        description: "User has been deactivated",
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to reject user:", error);
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    setProcessingId(userId);
    try {
      await userService.delete(userId);
      toast({
        title: "User Deleted",
        description: "User has been permanently deleted",
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setSelectedRole((prev) => ({ ...prev, [userId]: role }));

    // If user is already approved, update role immediately
    const user = users.find((u) => u.id === userId);
    if (user?.is_approved) {
      setProcessingId(userId);
      try {
        await userService.updateRole(userId, role);
        toast({
          title: "Role Updated",
          description: `User role changed to ${role}`,
        });
        fetchUsers();
      } catch (error) {
        console.error("Failed to update role:", error);
        toast({
          title: "Error",
          description: "Failed to update role",
          variant: "destructive",
        });
      } finally {
        setProcessingId(null);
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = users.filter((u) => !u.is_approved && u.is_active !== false).length;
  const approvedCount = users.filter((u) => u.is_approved).length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "scrum_master":
        return "bg-blue-100 text-blue-700";
      case "intern":
      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-500">Approve users and manage roles</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BadgeCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Approved Users</p>
                <p className="text-xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filter === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
                  filter === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Pending
                {pendingCount > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filter === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Approved
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
              <p className="text-gray-500 mt-2">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-300" />
              <p className="text-gray-500 mt-2">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Employee ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-400">@{user.username}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">
                          {user.employee_id || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {user.is_active === false ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            Deactivated
                          </span>
                        ) : user.is_approved ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={selectedRole[user.id] || user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          disabled={processingId === user.id}
                          className={`px-2 py-1 text-sm rounded-lg border ${getRoleBadgeColor(
                            selectedRole[user.id] || user.role
                          )}`}
                        >
                          <option value="intern">Intern</option>
                          <option value="scrum_master">Scrum Master</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(user.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {!user.is_approved && user.is_active !== false && (
                            <>
                              <button
                                onClick={() => handleApprove(user.id)}
                                disabled={processingId === user.id}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:opacity-50"
                                title="Approve"
                              >
                                {processingId === user.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <UserCheck size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(user.id)}
                                disabled={processingId === user.id}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
                                title="Reject"
                              >
                                <UserX size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={processingId === user.id}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUserApproval;
