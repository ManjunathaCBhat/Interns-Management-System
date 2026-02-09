import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/api";
import { Search, X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { jsPDF } from "jspdf";

interface ActivityTask {
  _id: string;
  title: string;
  status: string;
  created_at?: string;
  completedAt?: string;
  priority?: string;
  project?: string;
}

interface ActivityEntry {
  _id: string;
  date?: string;
  status?: string;
  yesterday?: string;
  today?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  created_at?: string;
}

interface AttendanceEntry {
  _id: string;
  date?: string;
  status?: string;
  remarks?: string;
  markedBy?: string;
  updatedAt?: string;
}

interface PerformanceUser {
  id: string;
  name: string;
  email: string;
  role: "intern" | "scrum_master";
  employee_id?: string;
  is_active?: boolean;
  internId?: string;
  batch?: string;
  internType?: string;
  taskCount?: number;
  completedTasks?: number;
  dsuStreak?: number;
  currentProject?: string;
  phone?: string;
  college?: string;
  cgpa?: number;
  joinedDate?: string;
  skills?: string[];
}

const PerformancePage: React.FC = () => {
  const [users, setUsers] = useState<PerformanceUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PerformanceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterBatch, setFilterBatch] = useState("all");
  const [selectedUser, setSelectedUser] = useState<PerformanceUser | null>(null);
  const [userTasks, setUserTasks] = useState<ActivityTask[]>([]);
  const [userDsus, setUserDsus] = useState<ActivityEntry[]>([]);
  const [userAttendance, setUserAttendance] = useState<AttendanceEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/performance/users");
      const usersData = Array.isArray(response.data) ? response.data : [];
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error fetching performance users:", error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...users];

    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== "all") {
      result = result.filter((user) => user.role === filterRole);
    }

    if (filterType !== "all") {
      result = result.filter(
        (user) => user.role === "intern" && user.internType === filterType
      );
    }

    if (filterBatch !== "all") {
      result = result.filter(
        (user) => user.role === "intern" && user.batch === filterBatch
      );
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterType, filterBatch, users]);

  const batches = Array.from(new Set(users.map((i) => i.batch).filter(Boolean)));

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleViewProgress = async (user: PerformanceUser) => {
    setSelectedUser(user);
    setShowModal(true);
    setLoadingTasks(true);

    try {
      const response = await apiClient.get("/admin/performance/activity", {
        params: { user_id: user.id },
      });
      const tasks = Array.isArray(response.data.tasks) ? response.data.tasks : [];
      const dsus = Array.isArray(response.data.dsus) ? response.data.dsus : [];
      const attendance = Array.isArray(response.data.attendance)
        ? response.data.attendance
        : [];

      const sortedTasks = tasks.sort((a: ActivityTask, b: ActivityTask) => {
        const dateA = a.completedAt || a.created_at || "";
        const dateB = b.completedAt || b.created_at || "";
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setUserTasks(sortedTasks);
      setUserDsus(dsus);
      setUserAttendance(attendance);
    } catch (error) {
      console.error("Error fetching activity:", error);
      setUserTasks([]);
      setUserDsus([]);
      setUserAttendance([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleExportReport = () => {
    if (!selectedUser) return;

    const normalizeStatus = (status?: string) => (status || "").toUpperCase();
    const isIntern = selectedUser.role === "intern";

    const completedTasks = userTasks.filter(
      (t) => normalizeStatus(t.status) === "DONE"
    );
    const inProgressTasks = userTasks.filter(
      (t) => normalizeStatus(t.status) === "IN_PROGRESS"
    );
    const notStartedTasks = userTasks.filter(
      (t) => normalizeStatus(t.status) === "NOT_STARTED"
    );

    const completedTasksWithTime = completedTasks.filter(
      (t) => t.completedAt && t.created_at
    );
    const avgCompletionTime = completedTasksWithTime.length > 0
      ? completedTasksWithTime.reduce((sum, task) => {
          const created = new Date(task.created_at as string).getTime();
          const completed = new Date(task.completedAt as string).getTime();
          return sum + (completed - created);
        }, 0) / completedTasksWithTime.length / (1000 * 60 * 60 * 24)
      : 0;

    const completionRate = selectedUser.taskCount
      ? ((selectedUser.completedTasks || 0) / selectedUser.taskCount) * 100
      : 0;

    const reportLines: string[] = [];
    reportLines.push("PERFORMANCE REPORT");
    reportLines.push("");
    reportLines.push("PERSONAL INFORMATION");
    reportLines.push(`Name: ${selectedUser.name}`);
    reportLines.push(`Email: ${selectedUser.email}`);
    reportLines.push(`Role: ${selectedUser.role}`);
    reportLines.push(`Employee ID: ${selectedUser.employee_id || "N/A"}`);
    if (isIntern) {
      reportLines.push(`Phone: ${selectedUser.phone || "N/A"}`);
      reportLines.push(`College: ${selectedUser.college || "N/A"}`);
      reportLines.push(`CGPA: ${selectedUser.cgpa || "N/A"}`);
      reportLines.push(`Intern Type: ${selectedUser.internType?.toUpperCase() || "N/A"}`);
      reportLines.push(`Batch: ${selectedUser.batch || "N/A"}`);
      reportLines.push(`Joined Date: ${formatDate(selectedUser.joinedDate)}`);
      reportLines.push(`Skills: ${selectedUser.skills?.join(", ") || "N/A"}`);
    }

    reportLines.push("");
    reportLines.push("ACTIVITY SUMMARY");
    if (isIntern) {
      reportLines.push(`Total Tasks: ${selectedUser.taskCount || 0}`);
      reportLines.push(`Completed Tasks: ${completedTasks.length}`);
      reportLines.push(`In Progress: ${inProgressTasks.length}`);
      reportLines.push(`Not Started: ${notStartedTasks.length}`);
      reportLines.push(`Completion Rate: ${completionRate.toFixed(1)}%`);
      reportLines.push(`Average Completion Time: ${avgCompletionTime.toFixed(1)} days`);
      reportLines.push(`DSU Entries: ${userDsus.length}`);
    } else {
      reportLines.push(`DSU Reviews: ${userDsus.length}`);
      reportLines.push(`Attendance Marks: ${userAttendance.length}`);
    }

    reportLines.push("");
    reportLines.push("DETAILED TASKS");
    if (isIntern && userTasks.length > 0) {
      userTasks.forEach((task, idx) => {
        reportLines.push(`${idx + 1}. ${task.title}`);
        reportLines.push(`   Status: ${task.status}`);
        reportLines.push(`   Project: ${task.project || "N/A"}`);
        reportLines.push(`   Priority: ${task.priority || "Normal"}`);
        reportLines.push(`   Created: ${formatDate(task.created_at)}`);
        reportLines.push(
          task.completedAt
            ? `   Completed: ${formatDate(task.completedAt)}`
            : "   Not completed yet"
        );
      });
    } else {
      reportLines.push("No task history available.");
    }

    reportLines.push("");
    reportLines.push("Generated on: " + new Date().toLocaleString());

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const lineHeight = 6;
    const maxWidth = pageWidth - margin * 2;

    let cursorY = margin;
    reportLines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, maxWidth);
      wrapped.forEach((segment: string) => {
        if (cursorY + lineHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(segment, margin, cursorY);
        cursorY += lineHeight;
      });
    });

    const filename = `${selectedUser.name.replace(/\s+/g, "_")}_Performance_Report_${new Date()
      .toISOString()
      .split("T")[0]}.pdf`;
    doc.save(filename);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
            <p className="text-gray-600 mt-1">Track intern and scrum master activity</p>
          </div>
          <div className="text-sm text-gray-600">
            Total Users: <span className="font-semibold">{filteredUsers.length}</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0F0E47] focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="intern">Intern</option>
                <option value="scrum_master">Scrum Master</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0F0E47] focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="project">Project</option>
                <option value="rs">RS</option>
              </select>

              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0F0E47] focus:border-transparent"
              >
                <option value="all">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>

              <Button
                onClick={() => {
                  setSearchTerm("");
                  setFilterRole("all");
                  setFilterType("all");
                  setFilterBatch("all");
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-xl font-semibold text-gray-800 mb-2">No users found</p>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sl.No</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user, index) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900">{startIndex + index + 1}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleViewProgress(user)}
                              className="text-sm font-medium text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                            >
                              {user.name}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.role === "scrum_master"
                                  ? "bg-[#8686AC]/20 text-[#272757]"
                                  : user.internType === "project"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.role === "scrum_master"
                                ? "SCRUM MASTER"
                                : user.internType?.toUpperCase() || "INTERN"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(user.joinedDate)}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              onClick={() => handleViewProgress(user)}
                              size="sm"
                              className="bg-[#0F0E47] hover:bg-[#272757]"
                            >
                              View Progress
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? "bg-[#0F0E47] text-white"
                                  : "hover:bg-gray-100 text-gray-700"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
              <div className="sticky top-0 bg-gradient-to-r from-[#0F0E47] to-[#505081] text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-[#0F0E47] flex-shrink-0">
                      {getInitials(selectedUser.name)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                      <p className="opacity-90 mt-1">{selectedUser.email}</p>
                      <p className="text-sm opacity-80">{selectedUser.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleExportReport}
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-[#0F0E47]"
                      disabled={loadingTasks}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  {selectedUser.role === "intern" ? (
                    <>
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="font-semibold">{selectedUser.phone || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">College</p>
                        <p className="font-semibold">{selectedUser.college || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">CGPA</p>
                        <p className="font-semibold">{selectedUser.cgpa || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Batch</p>
                        <p className="font-semibold">{selectedUser.batch || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Intern Type</p>
                        <p className="font-semibold">{selectedUser.internType?.toUpperCase() || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Joined Date</p>
                        <p className="font-semibold">{formatDate(selectedUser.joinedDate)}</p>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-xs text-gray-600 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.skills && selectedUser.skills.length > 0 ? (
                            selectedUser.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">No skills listed</span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-gray-600">Role</p>
                        <p className="font-semibold">Scrum Master</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="font-semibold">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Active</p>
                        <p className="font-semibold">{selectedUser.is_active ? "Yes" : "No"}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Activity Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedUser.role === "intern" ? (
                        <>
                          <p className="text-sm">Tasks: {userTasks.length}</p>
                          <p className="text-sm">DSU Entries: {userDsus.length}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm">DSU Reviews: {userDsus.length}</p>
                          <p className="text-sm">Attendance Marks: {userAttendance.length}</p>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {loadingTasks && (
                        <p className="text-sm text-muted-foreground">Loading activity...</p>
                      )}
                      {!loadingTasks && selectedUser.role === "intern" && userTasks.length === 0 && (
                        <p className="text-sm text-muted-foreground">No tasks yet.</p>
                      )}
                      {!loadingTasks && selectedUser.role === "scrum_master" && userDsus.length === 0 && (
                        <p className="text-sm text-muted-foreground">No reviews yet.</p>
                      )}
                      {selectedUser.role === "intern" && userTasks.slice(0, 5).map((task) => (
                        <div key={task._id} className="rounded-lg border p-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{task.title}</span>
                            <span className="text-xs text-muted-foreground">{task.status}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{task.project || "N/A"}</p>
                        </div>
                      ))}
                      {selectedUser.role === "scrum_master" && userDsus.slice(0, 5).map((entry) => (
                        <div key={entry._id} className="rounded-lg border p-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">DSU Review</span>
                            <span className="text-xs text-muted-foreground">{entry.status || ""}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{entry.date || ""}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PerformancePage;
