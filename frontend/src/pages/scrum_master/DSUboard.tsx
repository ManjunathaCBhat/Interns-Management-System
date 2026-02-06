import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Lock,
  X,
} from "lucide-react";
import DashboardLayout from '@/components/layout/DashboardLayout';
import apiClient from '@/services/apiClient';

/* ================= TYPES ================= */
interface Intern {
  _id: string;
  name: string;
  email: string;
  domain: string;
  status: string;
  currentProject: string;
  mentor: string;
}

interface Task {
  _id: string;
  internId: string;
  title: string;
  description: string;
  project: string;
  priority: string;
  status: string;
  dueDate: string;
  created_at: string;
}

interface DSU {
  _id: string;
  internId: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
  learnings: string;
}

interface Project {
  _id: string;
  name: string;
  status: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "scrum_master" | "intern";
}

interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: "intern" | "scrum_master";
}

interface ScrumMasterUser {
  id: string;
  name: string;
  email: string;
  role: "scrum_master";
}

interface BoardMember {
  _id: string;
  name: string;
  email: string;
  role: "intern" | "scrum_master";
  domain?: string;
  currentProject?: string;
}

/* ================= API FUNCTIONS ================= */
const fetchInterns = async (): Promise<Intern[]> => {
  const response = await apiClient.get('/interns/');
  // Handle paginated response format
  return Array.isArray(response.data) ? response.data : (response.data.items || []);
};

const fetchProjects = async (): Promise<Project[]> => {
  const response = await apiClient.get('/projects/');
  // Handle paginated response format
  return Array.isArray(response.data) ? response.data : (response.data.items || []);
};

const fetchTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get('/tasks/');
  // Handle paginated response format
  return Array.isArray(response.data) ? response.data : (response.data.items || []);
};

const fetchDSUs = async (): Promise<DSU[]> => {
  const response = await apiClient.get('/dsu-entries/');
  // Handle paginated response format
  return Array.isArray(response.data) ? response.data : (response.data.items || []);
};

const fetchScrumMasters = async (): Promise<ScrumMasterUser[]> => {
  try {
    const response = await apiClient.get('/users?role=scrum_master');
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  } catch (error) {
    console.error('Error loading scrum masters:', error);
    return [];
  }
};

const fetchInternUsers = async (): Promise<UserSummary[]> => {
  try {
    const response = await apiClient.get('/users?role=intern');
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  } catch (error) {
    console.error('Error loading intern users:', error);
    return [];
  }
};


/* ================= HELPER FUNCTIONS ================= */
const getTaskAging = (task: Task) => {
  if (!task.dueDate || task.status === "completed") return null;
  const today = new Date();
  const due = new Date(task.dueDate);
  const diff = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

  if (diff > 0 && task.priority === "high") {
    return { text: `🔴 High priority overdue by ${diff} days`, color: "#dc2626" };
  }
  if (diff > 0) {
    return { text: `⚠️ Overdue by ${diff} days`, color: "#ea580c" };
  }
  if (diff === 0) {
    return { text: "⏳ Due today", color: "#ca8a04" };
  }
  return null;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = [
    "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
    "#f43f5e", "#ef4444", "#f97316", "#eab308", "#84cc16",
    "#22c55e", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, { bg: string; color: string }> = {
    open: { bg: "#dbeafe", color: "#2563eb" },
    in_progress: { bg: "#fef9c3", color: "#ca8a04" },
    completed: { bg: "#dcfce7", color: "#16a34a" },
    blocked: { bg: "#fef2f2", color: "#dc2626" },
  };
  return styles[status] || { bg: "#f3f4f6", color: "#6b7280" };
};

/* ================= SIDEBAR MENU ================= */
// Sidebar menu removed - now using DashboardLayout

/* ================= MAIN COMPONENT ================= */
const Index: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [internUsers, setInternUsers] = useState<UserSummary[]>([]);
  const [scrumMasters, setScrumMasters] = useState<ScrumMasterUser[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dsus, setDsus] = useState<DSU[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceByMember, setAttendanceByMember] = useState<Record<string, "present" | "absent">>({});

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [internFilter, setInternFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const [startIndex, setStartIndex] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Sidebar state removed - now using DashboardLayout

  // Check if user is authorized (scrum_master or admin)
  const isAuthorized = currentUser?.role === 'scrum_master' || currentUser?.role === 'admin';

  const fetchAttendance = async (dateValue: string) => {
    try {
      const response = await apiClient.get('/office-attendance', {
        params: { date: dateValue },
      });
      const records = Array.isArray(response.data) ? response.data : (response.data.items || []);
      const nextState: Record<string, "present" | "absent"> = {};
      records.forEach((record: { internId?: string; status?: string }) => {
        if (!record?.internId) return;
        if (record.status === "present" || record.status === "absent") {
          nextState[record.internId] = record.status;
        }
      });
      setAttendanceByMember(nextState);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [internsData, projectsData, tasksData, dsusData, scrumMastersData, internUsersData] = await Promise.all([
          fetchInterns(),
          fetchProjects(),
          fetchTasks(),
          fetchDSUs(),
          fetchScrumMasters(),
          fetchInternUsers(),
        ]);
        setInterns(internsData);
        setProjects(projectsData);
        setTasks(tasksData);
        setDsus(dsusData);
        setScrumMasters(scrumMastersData);
        setInternUsers(internUsersData);
        await fetchAttendance(selectedDate);
        
        // Get current user from local storage or API
        const storedUser = localStorage.getItem('ilm_user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading DSU board data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [internsData, projectsData, tasksData, dsusData, scrumMastersData, internUsersData] = await Promise.all([
        fetchInterns(),
        fetchProjects(),
        fetchTasks(),
        fetchDSUs(),
        fetchScrumMasters(),
        fetchInternUsers(),
      ]);
      setInterns(internsData);
      setProjects(projectsData);
      setTasks(tasksData);
      setDsus(dsusData);
      setScrumMasters(scrumMastersData);
      setInternUsers(internUsersData);
      await fetchAttendance(selectedDate);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const yesterday = new Date(selectedDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const includeScrumMasters = internFilter === "all" && projectFilter === "all";
  const normalizeEmail = (email: string) => email.toLowerCase().trim();
  const internsByEmail = new Map(
    interns.map((intern) => [normalizeEmail(intern.email), intern])
  );

  const internMembers: BoardMember[] = internUsers.map((user) => {
    const match = internsByEmail.get(normalizeEmail(user.email));
    return {
      _id: match?._id || user.id,
      name: user.name,
      email: user.email,
      role: "intern",
      domain: match?.domain,
      currentProject: match?.currentProject,
    };
  });

  const scrumMasterMembers: BoardMember[] = scrumMasters.map((user) => {
    const match = internsByEmail.get(normalizeEmail(user.email));
    return {
      _id: match?._id || user.id,
      name: user.name,
      email: user.email,
      role: "scrum_master",
      domain: match?.domain || "Scrum Master",
      currentProject: match?.currentProject || "Leadership",
    };
  });

  const boardMembers = includeScrumMasters
    ? [...internMembers, ...scrumMasterMembers]
    : internMembers;

  const filteredMembers = boardMembers.filter((member) => {
    if (internFilter !== "all" && member._id !== internFilter) return false;
    if (projectFilter !== "all" && (member.currentProject || "") !== projectFilter) return false;
    return true;
  });

  const CARDS_VISIBLE = 3;
  const paddedMembers: (BoardMember | null)[] = [null, ...filteredMembers, null];

  const displayMembers = paddedMembers.slice(startIndex, startIndex + CARDS_VISIBLE);

  while (displayMembers.length < CARDS_VISIBLE) {
    displayMembers.push(null);
  }

  const getTasks = (internId: string, date: string) =>
    tasks.filter(
      (t) =>
        t.internId === internId &&
        t.created_at?.startsWith(date) &&
        (statusFilter === "all" || t.status === statusFilter)
    );

  const dsusForDate = dsus.filter((d) => d.date?.startsWith(selectedDate));
  const submittedMembers = new Set(
    dsusForDate
      .filter((d) => !d.status || d.status === "submitted")
      .map((d) => d.internId)
  );

  const totalMembers = boardMembers.length;

  const stats = {
    total: totalMembers,
    submitted: submittedMembers.size,
    notSubmitted: Math.max(0, totalMembers - submittedMembers.size),
    blocked: tasks.filter(
      (t) => t.status === "blocked" && t.created_at?.startsWith(selectedDate)
    ).length,
  };

  const markAttendance = async (memberId: string, statusValue: "present" | "absent") => {
    try {
      await apiClient.post('/office-attendance', {
        internId: memberId,
        date: selectedDate,
        status: statusValue,
      });
      setAttendanceByMember((prev) => ({ ...prev, [memberId]: statusValue }));
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  const canGoLeft = startIndex > 0;
  const canGoRight = startIndex + CARDS_VISIBLE < paddedMembers.length;

  const exportCSV = () => {
    const filteredTasks = tasks.filter((t) => {
      if (fromDate && new Date(t.created_at) < new Date(fromDate)) return false;
      if (toDate && new Date(t.created_at) > new Date(toDate)) return false;
      if (internFilter !== "all" && t.internId !== internFilter) return false;
      if (projectFilter !== "all" && t.project !== projectFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      return true;
    });

    const headers = ["Intern", "Task", "Project", "Status", "Priority", "Due Date", "Created"];
    const rows = filteredTasks.map((t) => {
      const intern = interns.find((i) => i._id === t.internId);
      return [
        intern?.name || "Unknown",
        t.title,
        t.project,
        t.status,
        t.priority,
        t.dueDate,
        t.created_at,
      ];
    });

    const csv =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((v) => `"${v ?? ""}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `DSU_Report_${selectedDate}.csv`;
    a.click();
    setExportOpen(false);
  };

  /* ================= INLINE STYLES ================= */
  const containerStyle: React.CSSProperties = {
    display: "flex",
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  // Sidebar styles removed - now using DashboardLayout

  const mainContentStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const topBarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 24px",
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    gap: "16px",
  };

  // Menu toggle style removed - now using DashboardLayout

  const pageTitleStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1e1145",
    flex: 1,
  };

  const headerActionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
  };

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    transition: "all 0.2s ease",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #1e1145, #2d1b69)",
    color: "white",
  };

  const outlineButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "#ffffff",
    color: "#1e1145",
    border: "1px solid #e2e8f0",
  };

  const contentAreaStyle: React.CSSProperties = {
    flex: 1,
    padding: "16px 24px",
    overflowY: "auto",
  };

  const statsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  };

  const statCardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "14px",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const statIconStyle = (bg: string): React.CSSProperties => ({
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: bg,
  });

  const statValueStyle: React.CSSProperties = {
    fontSize: "22px",
    fontWeight: 700,
    color: "#1e1145",
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#64748b",
  };

  const filtersCardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "16px",
    border: "1px solid #e2e8f0",
  };

  const filtersGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
  };

  const filterGroupStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  };

  const filterLabelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const inputStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#1e1145",
    fontSize: "13px",
    outline: "none",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "14px",
    paddingRight: "36px",
  };

  const carouselContainerStyle: React.CSSProperties = {
    position: "relative",
    padding: "16px 50px",
  };

  const carouselNavStyle = (disabled: boolean): React.CSSProperties => ({
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1e1145, #2d1b69)",
    border: "none",
    color: "white",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(30, 17, 69, 0.3)",
    zIndex: 10,
    opacity: disabled ? 0.4 : 1,
  });

  const cardsGridStyle: React.CSSProperties = {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    alignItems: "stretch",
    flexWrap: "nowrap",
  };

  const internCardStyle = (isCenter: boolean): React.CSSProperties => ({
    background: isCenter
      ? "linear-gradient(135deg, #1e1145 0%, #2d1b69 100%)"
      : "#ffffff",
    borderRadius: "16px",
    padding: "18px",
    border: isCenter ? "none" : "1px solid #e2e8f0",
    transition: "all 0.3s ease",
    transform: isCenter ? "scale(1.02)" : "scale(1)",
    boxShadow: isCenter
      ? "0 15px 40px rgba(30, 17, 69, 0.25)"
      : "0 2px 8px rgba(0,0,0,0.05)",
    color: isCenter ? "#ffffff" : "#1e1145",
    flex: "0 0 320px",
    minHeight: "440px",
    display: "flex",
    flexDirection: "column",
  });

  const cardHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  };

  const avatarStyle = (bg: string): React.CSSProperties => ({
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 700,
    fontSize: "16px",
    background: bg,
  });

  const cardNameStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "2px",
  };

  const cardDomainStyle = (isCenter: boolean): React.CSSProperties => ({
    fontSize: "12px",
    color: isCenter ? "rgba(255,255,255,0.7)" : "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  });

  const sectionStyle: React.CSSProperties = {
    marginBottom: "14px",
  };

  const sectionTitleStyle = (isCenter: boolean): React.CSSProperties => ({
    fontSize: "11px",
    fontWeight: 600,
    color: isCenter ? "rgba(255,255,255,0.6)" : "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "6px",
  });

  const sectionContentStyle = (isCenter: boolean, isToday: boolean): React.CSSProperties => ({
    background: isCenter
      ? isToday
        ? "rgba(168, 85, 247, 0.2)"
        : "rgba(255,255,255,0.1)"
      : isToday
        ? "#f0f9ff"
        : "#f8fafc",
    borderRadius: "10px",
    padding: "10px",
    minHeight: "50px",
  });

  const taskItemStyle: React.CSSProperties = {
    padding: "6px 0",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  };

  const taskTitleStyle = (isCenter: boolean): React.CSSProperties => ({
    fontSize: "13px",
    fontWeight: 500,
    color: isCenter ? "#ffffff" : "#1e1145",
  });

  const taskMetaStyle: React.CSSProperties = {
    display: "flex",
    gap: "6px",
    marginTop: "4px",
    alignItems: "center",
    flexWrap: "wrap",
  };

  const taskBadgeStyle = (bg: string, color: string): React.CSSProperties => ({
    fontSize: "10px",
    padding: "2px 6px",
    borderRadius: "6px",
    fontWeight: 500,
    background: bg,
    color: color,
  });

  const noDataStyle = (isCenter: boolean): React.CSSProperties => ({
    fontSize: "12px",
    color: isCenter ? "rgba(255,255,255,0.5)" : "#94a3b8",
    fontStyle: "italic",
  });

  const attendanceButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    marginTop: "auto",
    paddingTop: "12px",
  };
  const emptySlotStyle: React.CSSProperties = {
    minHeight: "440px",
    flex: "0 0 320px",
  };

  const attendBtnStyle = (type: "present" | "absent", active = false): React.CSSProperties => ({
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    background: type === "present"
      ? "linear-gradient(135deg, #22c55e, #16a34a)"
      : "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    boxShadow: active ? "0 0 0 2px rgba(30, 17, 69, 0.2)" : "none",
    opacity: active ? 1 : 0.9,
  });

  const modalStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  };

  const modalContentStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
  };

  const modalHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  };

  const modalTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1e1145",
  };

  const modalCloseStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "#f1f5f9",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const modalBodyStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "20px",
  };

  const modalFooterStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  };

  const restrictedContainerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1e1145 0%, #2d1b69 100%)",
    padding: "24px",
    textAlign: "center",
  };

  const restrictedIconStyle: React.CSSProperties = {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "rgba(239, 68, 68, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    border: "2px solid rgba(239, 68, 68, 0.3)",
  };

  const loadingContainerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1e1145 0%, #2d1b69 100%)",
    gap: "20px",
  };

  const spinnerStyle: React.CSSProperties = {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "4px solid rgba(168, 85, 247, 0.2)",
    borderTopColor: "#a855f7",
    animation: "spin 1s linear infinite",
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={spinnerStyle} />
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)" }}>Loading DSU Board...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={restrictedContainerStyle}>
        <div style={restrictedIconStyle}>
          <Lock size={42} color="#ef4444" />
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff", marginBottom: "10px" }}>
          Access Restricted
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", maxWidth: "360px", lineHeight: 1.6 }}>
          The DSU Board is only accessible to Scrum Masters and Administrators.
          Please contact your administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* MAIN CONTENT */}
      <div style={mainContentStyle}>
        {/* TOP BAR */}
        <div style={topBarStyle}>
          <h1 style={pageTitleStyle}>
            DSU Board -{" "}
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </h1>

          <div style={headerActionsStyle}>
            <button style={outlineButtonStyle} onClick={refreshData}>
              <RefreshCw size={14} /> Refresh
            </button>
            {isAuthorized && (
              <button style={primaryButtonStyle} onClick={() => setExportOpen(true)}>
                <Download size={14} /> Export
              </button>
            )}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div style={contentAreaStyle}>
          {/* STATS */}
          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <div style={statIconStyle("rgba(99, 102, 241, 0.15)")}>
                <Users size={20} color="#6366f1" />
              </div>
              <div>
                <div style={statValueStyle}>{stats.total}</div>
                <div style={statLabelStyle}>Total Interns</div>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle("rgba(34, 197, 94, 0.15)")}>
                <CheckCircle size={20} color="#22c55e" />
              </div>
              <div>
                <div style={statValueStyle}>{stats.submitted}</div>
                <div style={statLabelStyle}>Submitted</div>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle("rgba(234, 179, 8, 0.15)")}>
                <Clock size={20} color="#eab308" />
              </div>
              <div>
                <div style={statValueStyle}>{stats.notSubmitted}</div>
                <div style={statLabelStyle}>Pending</div>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle("rgba(239, 68, 68, 0.15)")}>
                <AlertTriangle size={20} color="#ef4444" />
              </div>
              <div>
                <div style={statValueStyle}>{stats.blocked}</div>
                <div style={statLabelStyle}>Blocked</div>
              </div>
            </div>
          </div>

          {/* FILTERS */}
          <div style={filtersCardStyle}>
            <div style={filtersGridStyle}>
              <div style={filterGroupStyle}>
                <label style={filterLabelStyle}>Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={filterGroupStyle}>
                <label style={filterLabelStyle}>Intern</label>
                <select
                  value={internFilter}
                  onChange={(e) => {
                    setInternFilter(e.target.value);
                    setStartIndex(0);
                  }}
                  style={selectStyle}
                >
                  <option value="all">All Members</option>
                  {boardMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.role.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>
              <div style={filterGroupStyle}>
                <label style={filterLabelStyle}>Project</label>
                <select
                  value={projectFilter}
                  onChange={(e) => {
                    setProjectFilter(e.target.value);
                    setStartIndex(0);
                  }}
                  style={selectStyle}
                >
                  <option value="all">All Projects</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={filterGroupStyle}>
                <label style={filterLabelStyle}>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={selectStyle}
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>

          {/* CARDS */}
          <div style={carouselContainerStyle}>
            <button
              style={{ ...carouselNavStyle(!canGoLeft), left: 0 }}
              disabled={!canGoLeft}
              onClick={() => setStartIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft size={20} />
            </button>

            <div style={cardsGridStyle}>
              {displayMembers.map((member, idx) => {
                if (!member) {
                  return <div key={`empty-${idx}`} style={emptySlotStyle} />;
                }

                const todayTasks = getTasks(member._id, selectedDate);
                const yesterdayTasks = getTasks(member._id, yesterdayStr);
                const isCenter = idx === 1;
                const roleLabel = member.role === "scrum_master" ? "Scrum Master" : member.domain || "Intern";
                const projectLabel = member.role === "scrum_master"
                  ? "Leadership"
                  : member.currentProject || "Unassigned";

                return (
                  <div key={member._id} style={internCardStyle(isCenter)}>
                    <div style={cardHeaderStyle}>
                      <div style={avatarStyle(getAvatarColor(member.name))}>
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <div style={cardNameStyle}>{member.name}</div>
                        <div style={cardDomainStyle(isCenter)}>
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "#22c55e",
                            }}
                          />
                          {roleLabel} • {projectLabel}
                        </div>
                      </div>
                    </div>

                    <div style={sectionStyle}>
                      <div style={sectionTitleStyle(isCenter)}>Yesterday</div>
                      <div style={sectionContentStyle(isCenter, false)}>
                        {yesterdayTasks.length > 0 ? (
                          yesterdayTasks.slice(0, 2).map((t) => (
                            <div key={t._id} style={taskItemStyle}>
                              <div style={taskTitleStyle(isCenter)}>{t.title}</div>
                              <div style={taskMetaStyle}>
                                <span style={taskBadgeStyle(getStatusBadge(t.status).bg, getStatusBadge(t.status).color)}>
                                  {t.status.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p style={noDataStyle(isCenter)}>No updates recorded</p>
                        )}
                      </div>
                    </div>

                    <div style={sectionStyle}>
                      <div style={sectionTitleStyle(isCenter)}>Today</div>
                      <div style={sectionContentStyle(isCenter, true)}>
                        {todayTasks.length > 0 ? (
                          todayTasks.slice(0, 3).map((t) => {
                            const aging = getTaskAging(t);
                            return (
                              <div key={t._id} style={taskItemStyle}>
                                <div style={taskTitleStyle(isCenter)}>{t.title}</div>
                                <div style={taskMetaStyle}>
                                  <span style={taskBadgeStyle(getStatusBadge(t.status).bg, getStatusBadge(t.status).color)}>
                                    {t.status.replace("_", " ")}
                                  </span>
                                  {t.priority === "high" && (
                                    <span style={taskBadgeStyle("#fef2f2", "#dc2626")}>High</span>
                                  )}
                                </div>
                                {aging && (
                                  <p style={{ fontSize: "10px", color: aging.color, marginTop: "3px" }}>
                                    {aging.text}
                                  </p>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p style={noDataStyle(isCenter)}>No tasks for today</p>
                        )}
                      </div>
                    </div>

                    {/* ATTENDANCE BUTTONS - BELOW CARD CONTENT */}
                    <div style={attendanceButtonsStyle}>
                      <button
                        style={attendBtnStyle("present", attendanceByMember[member._id] === "present")}
                        onClick={() => markAttendance(member._id, "present")}
                      >
                        <CheckCircle size={14} /> Present
                      </button>
                      <button
                        style={attendBtnStyle("absent", attendanceByMember[member._id] === "absent")}
                        onClick={() => markAttendance(member._id, "absent")}
                      >
                        <XCircle size={14} /> Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              style={{ ...carouselNavStyle(!canGoRight), right: 0 }}
              disabled={!canGoRight}
              onClick={() => setStartIndex((i) => Math.min(paddedMembers.length - CARDS_VISIBLE, i + 1))}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* EXPORT MODAL */}
      {exportOpen && (
        <div style={modalStyle} onClick={() => setExportOpen(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>Export Report</h2>
              <button style={modalCloseStyle} onClick={() => setExportOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div style={modalBodyStyle}>
              <div style={filterGroupStyle}>
                <label style={filterLabelStyle}>From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={filterGroupStyle}>
                <label style={filterLabelStyle}>To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <p style={{ fontSize: "12px", color: "#64748b" }}>
                Current filters will be applied to the export.
              </p>
            </div>
            <div style={modalFooterStyle}>
              <button style={outlineButtonStyle} onClick={() => setExportOpen(false)}>
                Cancel
              </button>
              <button style={primaryButtonStyle} onClick={exportCSV}>
                <Download size={14} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Index;
