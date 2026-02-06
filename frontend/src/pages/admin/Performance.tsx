import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { internService } from "@/services/internService";
import { taskService } from "@/services/taskService";
import { Intern } from "@/types/intern";
import { Search, X, ChevronLeft, ChevronRight, Download } from "lucide-react";
interface Task {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  priority?: string;
}

const PerformancePage: React.FC = () => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [filteredInterns, setFilteredInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterBatch, setFilterBatch] = useState("all");
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [internTasks, setInternTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all interns
  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const response = await internService.getAll({
        skip: 0,
        limit: 200
      });
      const internsData = Array.isArray(response.items) ? response.items : [];
      setInterns(internsData);
      setFilteredInterns(internsData);
    } catch (error) {
      console.error("Error fetching interns:", error);
      setInterns([]);
      setFilteredInterns([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    let result = [...interns];
    if (searchTerm) {
      result = result.filter(
        (intern) =>
          intern.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          intern.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType !== "all") {
      result = result.filter((intern) => intern.internType === filterType);
    }
    if (filterBatch !== "all") {
      result = result.filter((intern) => intern.batch === filterBatch);
    }

    setFilteredInterns(result);
    setCurrentPage(1);
  }, [searchTerm, filterType, filterBatch, interns]);
  const batches = Array.from(new Set(interns.map((i) => i.batch).filter(Boolean)));
  const totalPages = Math.ceil(filteredInterns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInterns = filteredInterns.slice(startIndex, endIndex);
  const handleViewProgress = async (intern: Intern) => {
    setSelectedIntern(intern);
    setShowModal(true);
    setLoadingTasks(true);

    try {
      const response = await taskService.getAll({ intern_id: intern._id });
      const tasks = response || [];
      const sortedTasks = tasks.sort((a: Task, b: Task) => {
        const dateA = a.completedAt || a.createdAt;
        const dateB = b.completedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      setInternTasks(sortedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setInternTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleExportReport = () => {
    if (!selectedIntern) return;

    const completionRate = selectedIntern.taskCount
      ? ((selectedIntern.completedTasks || 0) / selectedIntern.taskCount) * 100
      : 0;

    const completedTasks = internTasks.filter(t => t.status === "DONE");
    const inProgressTasks = internTasks.filter(t => t.status === "IN_PROGRESS");
    const notStartedTasks = internTasks.filter(t => t.status === "NOT_STARTED");
    const completedTasksWithTime = completedTasks.filter(t => t.completedAt && t.createdAt);
    const avgCompletionTime = completedTasksWithTime.length > 0
      ? completedTasksWithTime.reduce((sum, task) => {
          const created = new Date(task.createdAt).getTime();
          const completed = new Date(task.completedAt!).getTime();
          return sum + (completed - created);
        }, 0) / completedTasksWithTime.length / (1000 * 60 * 60 * 24)
      : 0;

    const reportData = `
INTERN PERFORMANCE REPORT
=========================

PERSONAL INFORMATION
--------------------
Name: ${selectedIntern.name}
Email: ${selectedIntern.email}
Employee ID: ${selectedIntern.employeeId || "N/A"}
Phone: ${selectedIntern.phone || "N/A"}
College: ${selectedIntern.college || "N/A"}
CGPA: ${selectedIntern.cgpa || "N/A"}

INTERNSHIP DETAILS
------------------
Intern Type: ${selectedIntern.internType?.toUpperCase() || "N/A"}
Batch: ${selectedIntern.batch || "N/A"}
Joined Date: ${formatDate(selectedIntern.joinedDate)}
Skills: ${selectedIntern.skills?.join(", ") || "N/A"}

PERFORMANCE METRICS
-------------------
Total Tasks: ${selectedIntern.taskCount || 0}
Completed Tasks: ${completedTasks.length}
In Progress: ${inProgressTasks.length}
Not Started: ${notStartedTasks.length}
Completion Rate: ${completionRate.toFixed(1)}%
Average Completion Time: ${avgCompletionTime.toFixed(1)} days

TASK BREAKDOWN BY STATUS
------------------------
✅ Completed: ${completedTasks.length}
🔄 In Progress: ${inProgressTasks.length}
⏸️  Not Started: ${notStartedTasks.length}

DETAILED TASK HISTORY
=====================
${internTasks.map((task, idx) => `
${idx + 1}. ${task.title}
   Status: ${task.status}
   Priority: ${task.priority || "Normal"}
   Created: ${formatDate(task.createdAt)}
   ${task.completedAt ? `Completed: ${formatDate(task.completedAt)}` : "Not completed yet"}
   ${task.completedAt && task.createdAt ? `Time Taken: ${Math.ceil((new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days` : ""}
`).join("\n")}

SUMMARY
=======
This report provides a comprehensive overview of ${selectedIntern.name}'s performance
during their internship at Cirruslabs. The metrics above reflect their task completion
rate, efficiency, and overall progress.

Generated on: ${new Date().toLocaleString()}
Report ID: ${selectedIntern._id}
    `.trim();

    const blob = new Blob([reportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedIntern.name.replace(/\s+/g, "_")}_Performance_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const getTaskStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DONE":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "NOT_STARTED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
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
            <p className="text-gray-600 mt-1">Track intern progress and performance metrics</p>
          </div>
          <div className="text-sm text-gray-600">
            Total Interns: <span className="font-semibold">{filteredInterns.length}</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="project">Project</option>
                <option value="rs">RS</option>
              </select>

              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-gray-600">Loading interns...</p>
              </div>
            ) : filteredInterns.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-xl font-semibold text-gray-800 mb-2">No interns found</p>
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
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInterns.map((intern, index) => (
                        <tr key={intern._id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900">{startIndex + index + 1}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleViewProgress(intern)}
                              className="text-sm font-medium text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                            >
                              {intern.name}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{intern.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                intern.internType === "project"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {intern.internType?.toUpperCase() || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(intern.joinedDate)}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              onClick={() => handleViewProgress(intern)}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
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
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredInterns.length)} of {filteredInterns.length} interns
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                                  ? "bg-purple-600 text-white"
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
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
        {showModal && selectedIntern && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-purple-600 flex-shrink-0">
                      {getInitials(selectedIntern.name)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedIntern.name}</h2>
                      <p className="opacity-90 mt-1">{selectedIntern.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedIntern.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">College</p>
                    <p className="font-semibold">{selectedIntern.college || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">CGPA</p>
                    <p className="font-semibold">{selectedIntern.cgpa || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Batch</p>
                    <p className="font-semibold">{selectedIntern.batch || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Intern Type</p>
                    <p className="font-semibold">{selectedIntern.internType?.toUpperCase() || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Joined Date</p>
                    <p className="font-semibold">{formatDate(selectedIntern.joinedDate)}</p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs text-gray-600 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedIntern.skills && selectedIntern.skills.length > 0 ? (
                        selectedIntern.skills.map((skill) => (
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
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">Performance Metrics</h3>

                    <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
                      <p className="text-3xl font-bold text-blue-600">
                        {selectedIntern.taskCount || 0}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Total Tasks</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                      <p className="text-3xl font-bold text-green-600">
                        {internTasks.filter((task) => task.status === "DONE").length}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Completed Tasks</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Task Progress</p>
                      <div className="space-y-2">
                        {(() => {
                          const done = internTasks.filter((task) => task.status === "DONE").length;
                          const inProgress = internTasks.filter((task) => task.status === "IN_PROGRESS").length;
                          const notStarted = internTasks.filter((task) => task.status === "NOT_STARTED").length;
                          const total = internTasks.length || 1;

                          return (
                            <>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-green-700">Completed</span>
                                  <span className="font-semibold">{done}</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500"
                                    style={{ width: `${(done / total) * 100}%` }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-blue-700">In Progress</span>
                                  <span className="font-semibold">{inProgress}</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${(inProgress / total) * 100}%` }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-700">Pending</span>
                                  <span className="font-semibold">{notStarted}</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gray-400"
                                    style={{ width: `${(notStarted / total) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg text-center border border-orange-200">
                      <p className="text-2xl font-bold text-orange-600">
                        {(() => {
                          const completedTasks = internTasks.filter(
                            (task) => task.status === "DONE" && task.completedAt && task.createdAt
                          );
                          if (completedTasks.length === 0) return "N/A";

                          const avgTime =
                            completedTasks.reduce((sum, task) => {
                              const created = new Date(task.createdAt).getTime();
                              const completed = new Date(task.completedAt!).getTime();
                              return sum + (completed - created);
                            }, 0) /
                            completedTasks.length /
                            (1000 * 60 * 60 * 24);

                          return `${avgTime.toFixed(1)} days`;
                        })()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Avg. Completion Time</p>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Completed Tasks</h3>
                      <Button
                        onClick={handleExportReport}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export Report
                      </Button>
                    </div>

                    {loadingTasks ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        <p className="mt-2 text-gray-600 text-sm">Loading tasks...</p>
                      </div>
                    ) : internTasks.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600">No tasks completed yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {internTasks.map((task) => (
                          <div
                            key={task._id}
                            className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow bg-white"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900 flex-1">{task.title}</h4>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTaskStatusColor(
                                  task.status
                                )}`}
                              >
                                {task.status.replace("_", " ")}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                📅 Created: {formatDate(task.createdAt)}
                              </span>
                              {task.completedAt && (
                                <>
                                  <span className="flex items-center gap-1">
                                    ✅ Completed: {formatDate(task.completedAt)}
                                  </span>
                                  <span className="flex items-center gap-1 text-green-600 font-medium">
                                    ⏱️ {Math.ceil(
                                      (new Date(task.completedAt).getTime() -
                                        new Date(task.createdAt).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )} days
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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