import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import apiClient from "@/lib/api";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  TrendingUp,
  CheckCircle2,
  Clock,
  Mail,
} from "lucide-react";

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
  organization?: string;
}

type ExportType = "all" | "batch" | "individual";

// ── Decode JWT and extract logged-in admin's email ──────────────────────
const getAdminEmail = (): string => {
  try {
    // Try common token storage keys
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("access_token") ||
      "";
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Try all common JWT email fields
    return (
      payload.email ||
      payload.preferred_username ||
      payload.upn ||
      (payload.sub?.includes("@") ? payload.sub : "") ||
      ""
    );
  } catch {
    return "";
  }
};

const PerformancePage: React.FC = () => {
  const [users, setUsers] = useState<PerformanceUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PerformanceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterBatch, setFilterBatch] = useState("all");
  const [filterProject, setFilterProject] = useState("all");

  const [selectedUser, setSelectedUser] = useState<PerformanceUser | null>(null);
  const [userTasks, setUserTasks] = useState<ActivityTask[]>([]);
  const [userDsus, setUserDsus] = useState<ActivityEntry[]>([]);
  const [userAttendance, setUserAttendance] = useState<AttendanceEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<ExportType>("all");
  const [exportBatch, setExportBatch] = useState("all");
  const [exportIndividualId, setExportIndividualId] = useState("");
  const [exportEmailMode, setExportEmailMode] = useState<"input" | "myself">("myself");
  const [exportEmail, setExportEmail] = useState("");
  const [exportSending, setExportSending] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportEmailError, setExportEmailError] = useState("");
  const [exportError, setExportError] = useState("");
  const [exportNoData, setExportNoData] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ── Logged-in admin's real email from JWT ─────────────────────────────
  const adminEmail = getAdminEmail();

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

    if (filterRole !== "all") result = result.filter((u) => u.role === filterRole);
    if (filterType !== "all")
      result = result.filter((u) => u.role === "intern" && u.internType === filterType);
    if (filterBatch !== "all")
      result = result.filter((u) => u.role === "intern" && u.batch === filterBatch);
    if (filterProject !== "all")
      result = result.filter((u) => u.role === "intern" && u.currentProject === filterProject);

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterType, filterBatch, filterProject, users]);

  const batches = Array.from(new Set(users.map((i) => i.batch).filter(Boolean))) as string[];
  const projects = Array.from(
    new Set(users.map((i) => i.currentProject).filter(Boolean))
  ) as string[];

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleReset = () => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterType("all");
    setFilterBatch("all");
    setFilterProject("all");
    fetchUsers();
  };

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
      const attendance = Array.isArray(response.data.attendance) ? response.data.attendance : [];

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

  const buildExcelRows = (usersToExport: PerformanceUser[]) =>
    usersToExport.map((user) => ({
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Organization: user.organization || "",
      EmployeeID: user.employee_id || "",
      Batch: user.batch || "",
      InternType: user.internType || "",
      Project: user.currentProject || "",
      Phone: user.phone || "",
      College: user.college || "",
      CGPA: user.cgpa || "",
      JoinedDate: user.joinedDate || "",
      TaskCount: user.taskCount || 0,
      CompletedTasks: user.completedTasks || 0,
      DSUStreak: user.dsuStreak || 0,
      Skills: user.skills ? user.skills.join(", ") : "",
    }));

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const resetExportModal = () => {
    setExportType("all");
    setExportBatch("all");
    setExportIndividualId("");
    setExportEmailMode("myself");
    setExportEmail("");
    setExportEmailError("");
    setExportError("");
    setExportNoData(false);
    setExportSuccess(false);
  };

  const handleExportConfirm = async () => {
    setExportEmailError("");
    setExportError("");
    setExportNoData(false);

    // ── 1. Email validation ───────────────────────────────────────────────
    if (exportEmailMode === "input") {
      if (!exportEmail.trim()) {
        setExportEmailError("Email address is required.");
        return;
      }
      if (!isValidEmail(exportEmail)) {
        setExportEmailError("Please enter a valid email address.");
        return;
      }
    }

    // ── 2. Resolve recipient email ────────────────────────────────────────
   
    const targetEmail = exportEmailMode === "myself" ? adminEmail : exportEmail.trim();

    if (!targetEmail) {
      setExportEmailError("Could not determine your email. Please use 'Enter Email' instead.");
      return;
    }

    // ── 3. Build user set ─────────────────────────────────────────────────
    let usersToExport: PerformanceUser[] = [];

    if (exportType === "all") {
      usersToExport = users;
    } else if (exportType === "batch") {
      usersToExport =
        exportBatch === "all" ? users : users.filter((u) => u.batch === exportBatch);
    } else if (exportType === "individual") {
      const found = users.find((u) => u.id === exportIndividualId);
      usersToExport = found ? [found] : [];
    }

    // ── 4. Empty data guard ───────────────────────────────────────────────
    if (usersToExport.length === 0) {
      setExportNoData(true);
      return;
    }

    setExportSending(true);

    // ── 5. Send via API —───────────────────
    try {
      const rows = buildExcelRows(usersToExport);

      await apiClient.post("/admin/performance/export-email", {
        to_email: targetEmail,
        exportType,
        exportBatch: exportType === "batch" ? exportBatch : undefined,
        userId: exportType === "individual" ? exportIndividualId : undefined,
        generatedAt: new Date().toISOString(),
        rows,
      });

      setExportSending(false);
      setExportSuccess(true);

      setTimeout(() => {
        resetExportModal();
        setShowExportModal(false);
      }, 2500);
    } catch (err) {
      setExportSending(false);
      setExportError("Email delivery failed. Please retry.");
    }
  };

  const today = () => new Date().toISOString().split("T")[0];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Top Header Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <Button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0F0E47] to-[#505081] hover:opacity-90 text-white"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Reset
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 border border-gray-300 focus:ring-2 focus:ring-[#0F0E47]"
              />
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F0E47] focus:border-transparent bg-white cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="project">Project</option>
                <option value="rs">RS</option>
              </select>

              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F0E47] focus:border-transparent bg-white cursor-pointer"
              >
                <option value="all">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>

              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F0E47] focus:border-transparent bg-white cursor-pointer"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* User Cards */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-4">
                    <Skeleton className="h-40 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-xl font-semibold text-gray-800 mb-2">No users found</p>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentUsers.map((user) => {
                    const completionRate = user.taskCount
                      ? ((user.completedTasks || 0) / user.taskCount) * 100
                      : 0;

                    return (
                      <div
                        key={user.id}
                        className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col"
                        onClick={() => handleViewProgress(user)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0F0E47] to-[#505081] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {getInitials(user.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                              user.role === "scrum_master"
                                ? "bg-[#8686AC]/20 text-[#272757]"
                                : user.internType === "project"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {user.role === "scrum_master"
                              ? "SM"
                              : user.internType?.toUpperCase().charAt(0) || "I"}
                          </span>
                        </div>

                        <div className="space-y-3 mb-4 flex-1">
                          {user.role === "intern" ? (
                            <>
                              {user.taskCount !== undefined && (
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs text-gray-600">Task Progress</p>
                                    <p className="text-xs font-semibold text-gray-900">
                                      {user.completedTasks || 0}/{user.taskCount}
                                    </p>
                                  </div>
                                  <Progress value={completionRate} className="h-2 bg-gray-200" />
                                  <p className="text-xs text-gray-500 mt-1">
                                    {completionRate.toFixed(0)}% Complete
                                  </p>
                                </div>
                              )}
                              {user.dsuStreak !== undefined && (
                                <div className="flex items-center gap-2 bg-amber-50 p-2 rounded">
                                  <TrendingUp className="h-4 w-4 text-amber-600" />
                                  <div>
                                    <p className="text-xs text-amber-700 font-semibold">DSU Streak</p>
                                    <p className="text-sm font-bold text-amber-900">
                                      {user.dsuStreak} days
                                    </p>
                                  </div>
                                </div>
                              )}
                              {user.currentProject && (
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Current Project</p>
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.currentProject}
                                  </p>
                                </div>
                              )}
                              <div className="text-xs text-gray-500 pt-1">
                                Joined: {formatDate(user.joinedDate)}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="text-xs text-blue-700 font-semibold">Scrum Master</p>
                                <p className="text-xs text-blue-600">
                                  {user.is_active ? "Active" : "Inactive"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProgress(user);
                          }}
                          className="w-full mt-auto bg-gradient-to-r from-[#0F0E47] to-[#505081] hover:opacity-90 text-white text-sm"
                        >
                          View Details
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of{" "}
                      {filteredUsers.length} users
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
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) pageNum = i + 1;
                          else if (currentPage <= 3) pageNum = i + 1;
                          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                          else pageNum = currentPage - 2 + i;
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

        {/* ══ EXPORT MODAL ══ */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="bg-gradient-to-r from-[#0F0E47] to-[#505081] text-white p-6 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="h-6 w-6" />
                  <h2 className="text-xl font-bold">Export Report</h2>
                </div>
                <button
                  onClick={() => { resetExportModal(); setShowExportModal(false); }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Export Type */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Export Condition</p>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "Export All Records" },
                      { value: "batch", label: "Export Batch-wise" },
                      { value: "individual", label: "Export Individual User" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          exportType === opt.value
                            ? "border-[#0F0E47] bg-[#0F0E47]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="exportType"
                          value={opt.value}
                          checked={exportType === opt.value}
                          onChange={() => setExportType(opt.value as ExportType)}
                          className="accent-[#0F0E47]"
                        />
                        <span className="text-sm text-gray-800 font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {exportType === "batch" && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Select Batch</p>
                    <select
                      value={exportBatch}
                      onChange={(e) => setExportBatch(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F0E47] bg-white"
                    >
                      <option value="all">All Batches</option>
                      {batches.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}

                {exportType === "individual" && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Select User</p>
                    <select
                      value={exportIndividualId}
                      onChange={(e) => setExportIndividualId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F0E47] bg-white"
                    >
                      <option value="">-- Select a user --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Email Delivery */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Delivery
                  </p>
                  <div className="space-y-2 mb-3">
                    {/* Myself option — shows real logged-in admin email */}
                    <label
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        exportEmailMode === "myself"
                          ? "border-[#0F0E47] bg-[#0F0E47]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="emailMode"
                        value="myself"
                        checked={exportEmailMode === "myself"}
                        onChange={() => setExportEmailMode("myself")}
                        className="accent-[#0F0E47]"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-800">Myself</span>
                        {/* ✅ Real email from JWT — no more hardcoded placeholder */}
                        <p className="text-xs text-gray-500">
                          
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        exportEmailMode === "input"
                          ? "border-[#0F0E47] bg-[#0F0E47]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="emailMode"
                        value="input"
                        checked={exportEmailMode === "input"}
                        onChange={() => setExportEmailMode("input")}
                        className="accent-[#0F0E47]"
                      />
                      <span className="text-sm font-medium text-gray-800">Enter Email</span>
                    </label>
                  </div>

                  {exportEmailMode === "input" && (
                    <div className="mt-2">
                      <Input
                        type="email"
                        placeholder="Enter email address..."
                        value={exportEmail}
                        onChange={(e) => {
                          setExportEmail(e.target.value);
                          if (exportEmailError) setExportEmailError("");
                        }}
                        className={`border focus:ring-2 focus:ring-[#0F0E47] ${
                          exportEmailError ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {exportEmailError && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {exportEmailError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* No data warning */}
                {exportNoData && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-4 py-3 text-sm">
                    <span className="text-lg leading-none">⚠️</span>
                    <span>No data found for the selected criteria. Please change your selection and try again.</span>
                  </div>
                )}

                {/* API error */}
                {exportError && (
                  <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3">
                    <p className="text-sm text-red-700 mb-2">{exportError}</p>
                    <button
                      onClick={handleExportConfirm}
                      className="text-xs font-semibold text-red-700 underline hover:text-red-900"
                    >
                      Retry email delivery
                    </button>
                  </div>
                )}

                {/* Success */}
                {exportSuccess && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-300 text-green-800 rounded-lg px-4 py-3 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Report sent to email successfully!
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => { resetExportModal(); setShowExportModal(false); }}
                    className="flex-1 border-gray-300"
                    disabled={exportSending}
                  >
                    Cancel
                  </Button>
                  {!exportSuccess && (
                    <Button
                      onClick={handleExportConfirm}
                      disabled={
                        exportSending ||
                        (exportType === "individual" && !exportIndividualId)
                      }
                      className="flex-1 bg-gradient-to-r from-[#0F0E47] to-[#505081] hover:opacity-90 text-white flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {exportSending ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                          </svg>
                          Sending...
                        </span>
                      ) : exportError ? (
                        <>
                          <Mail className="h-4 w-4" />
                          Retry
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Send Report
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ DETAIL MODAL ══ */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
              <div className="sticky top-0 bg-gradient-to-r from-[#0F0E47] to-[#505081] text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-[#0F0E47] flex-shrink-0 shadow-md">
                      {getInitials(selectedUser.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                      <p className="opacity-90 mt-1 truncate">{selectedUser.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-20">
                          {selectedUser.role === "scrum_master"
                            ? "Scrum Master"
                            : selectedUser.internType?.toUpperCase() || "Intern"}
                        </span>
                        {selectedUser.role === "intern" && selectedUser.batch && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-20">
                            Batch: {selectedUser.batch}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#0F0E47]" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Email</p>
                      <p className="text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Employee ID</p>
                      <p className="text-sm text-gray-900">{selectedUser.employee_id || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Role</p>
                      <p className="text-sm text-gray-900">{selectedUser.role}</p>
                    </div>
                    {selectedUser.role === "intern" && (
                      <>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1">Phone</p>
                          <p className="text-sm text-gray-900">{selectedUser.phone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1">College</p>
                          <p className="text-sm text-gray-900">{selectedUser.college || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1">CGPA</p>
                          <p className="text-sm text-gray-900">{selectedUser.cgpa || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1">Organization</p>
                          <p className="text-sm text-gray-900">{selectedUser.organization || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1">Batch</p>
                          <p className="text-sm text-gray-900">{selectedUser.batch || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1">Intern Type</p>
                          <p className="text-sm text-gray-900">
                            {selectedUser.internType?.toUpperCase() || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1">Joined Date</p>
                          <p className="text-sm text-gray-900">{formatDate(selectedUser.joinedDate)}</p>
                        </div>
                        <div className="md:col-span-3">
                          <p className="text-xs text-gray-600 font-semibold mb-2">Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedUser.skills && selectedUser.skills.length > 0 ? (
                              selectedUser.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">No skills listed</span>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#0F0E47]" />
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.role === "intern" ? (
                      <>
                        {selectedUser.taskCount !== undefined && (
                          <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-xs text-gray-600 font-semibold mb-1">Task Completion</p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {selectedUser.completedTasks || 0}/{selectedUser.taskCount}
                                </p>
                              </div>
                              <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0" />
                            </div>
                            <Progress
                              value={((selectedUser.completedTasks || 0) / selectedUser.taskCount) * 100}
                              className="h-2 bg-blue-200 mb-2"
                            />
                            <p className="text-xs text-gray-600">
                              {(((selectedUser.completedTasks || 0) / selectedUser.taskCount) * 100).toFixed(0)}% Complete
                            </p>
                          </div>
                        )}
                        {selectedUser.dsuStreak !== undefined && (
                          <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-xs text-gray-600 font-semibold mb-1">DSU Streak</p>
                                <p className="text-2xl font-bold text-gray-900">{selectedUser.dsuStreak} days</p>
                              </div>
                              <TrendingUp className="h-6 w-6 text-amber-600 flex-shrink-0" />
                            </div>
                            <p className="text-xs text-gray-600">Consecutive daily updates</p>
                          </div>
                        )}
                        <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-md transition">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs text-gray-600 font-semibold mb-1">DSU Entries</p>
                              <p className="text-2xl font-bold text-gray-900">{userDsus.length}</p>
                            </div>
                            <Clock className="h-6 w-6 text-purple-600 flex-shrink-0" />
                          </div>
                          <p className="text-xs text-gray-600">Daily standup updates submitted</p>
                        </div>
                        <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-md transition">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs text-gray-600 font-semibold mb-1">Current Project</p>
                              <p className="text-lg font-bold text-gray-900 truncate">
                                {selectedUser.currentProject || "N/A"}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">Active project assignment</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs text-gray-600 font-semibold mb-1">DSU Reviews</p>
                              <p className="text-2xl font-bold text-gray-900">{userDsus.length}</p>
                            </div>
                            <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0" />
                          </div>
                          <p className="text-xs text-gray-600">Total DSUs reviewed</p>
                        </div>
                        <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-md transition">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs text-gray-600 font-semibold mb-1">Attendance Marks</p>
                              <p className="text-2xl font-bold text-gray-900">{userAttendance.length}</p>
                            </div>
                            <Clock className="h-6 w-6 text-purple-600 flex-shrink-0" />
                          </div>
                          <p className="text-xs text-gray-600">Total attendance marked</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#0F0E47]" />
                    Recent Activity
                  </h3>
                  {loadingTasks ? (
                    <div className="text-center py-8 text-gray-500">Loading activity...</div>
                  ) : selectedUser.role === "intern" && userTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No tasks found</div>
                  ) : selectedUser.role === "scrum_master" && userDsus.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No reviews found</div>
                  ) : (
                    <div className="space-y-3">
                      {selectedUser.role === "intern" &&
                        userTasks.slice(0, 8).map((task) => (
                          <div
                            key={task._id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{task.title}</h4>
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  task.status === "DONE"
                                    ? "bg-green-100 text-green-800"
                                    : task.status === "IN_PROGRESS"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {task.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              {task.project && <span>Project: {task.project}</span>}
                              {task.priority && <span>Priority: {task.priority}</span>}
                              {task.created_at && <span>Created: {formatDate(task.created_at)}</span>}
                            </div>
                          </div>
                        ))}
                      {selectedUser.role === "scrum_master" &&
                        userDsus.slice(0, 8).map((entry) => (
                          <div
                            key={entry._id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">DSU Review</h4>
                              {entry.status && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                  {entry.status}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">Date: {formatDate(entry.date)}</p>
                          </div>
                        ))}
                    </div>
                  )}
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