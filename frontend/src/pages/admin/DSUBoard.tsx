import React, { useEffect, useState, useMemo } from "react";
import {
  RefreshCw, Download, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, AlertTriangle, Users,
  Lock, X, Search, Home, PlaneTakeoff, Building2,
  CheckCircle2, FileX, CalendarX, SlidersHorizontal,
  LucideIcon,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════ */
interface Intern {
  _id: string; name: string; email: string;
  domain: string; status: string; currentProject: string;
  mentor: string; batch?: string;
}
interface Task {
  _id: string; internId: string; title: string; description: string;
  project: string; priority: string; status: string;
  dueDate: string; created_at: string;
}
type WorkModeType = "wfh" | "pto" | "in_office";
interface DSU {
  _id: string; internId: string; date: string;
  yesterday: string; today: string;
  blockers?: string; learnings?: string; status?: string;
  workMode?: WorkModeType;   // aliased by aggregation pipeline
  work_mode?: WorkModeType;  // raw field fallback
}
interface Project { _id: string; name: string; status: string; }
interface UserSummary {
  id: string; name: string; email: string;
  role: "intern" | "scrum_master"; batch?: string;
}
interface ScrumMasterUser { id: string; name: string; email: string; role: "scrum_master"; }
interface BoardMember {
  _id: string; name: string; email: string;
  role: "intern" | "scrum_master";
  domain?: string; currentProject?: string; batch?: string;
}

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */
const AVATAR_COLORS = ["#0F0E47","#272757","#505081","#6D6D9A","#3F3F72","#2C2C5E","#4C4C7A","#3A3A6B"];

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  open:        { label: "Open",        bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  in_progress: { label: "In Progress", bg: "#fef9c3", color: "#a16207", dot: "#eab308" },
  completed:   { label: "Done",        bg: "#dcfce7", color: "#15803d", dot: "#22c55e" },
  done:        { label: "Done",        bg: "#dcfce7", color: "#15803d", dot: "#22c55e" },
  blocked:     { label: "Blocked",     bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
};

const WORK_MODE_CONFIG: Record<WorkModeType, {
  label: string; Icon: LucideIcon; lightBg: string; lightColor: string;
}> = {
  wfh:       { label: "WFH",       Icon: Home,         lightBg: "#dbeafe", lightColor: "#1d4ed8" },
  pto:       { label: "PTO",       Icon: PlaneTakeoff, lightBg: "#fef9c3", lightColor: "#a16207" },
  in_office: { label: "In Office", Icon: Building2,    lightBg: "#dcfce7", lightColor: "#15803d" },
};

/* ═══════════════════════════════════════════════════════
   API
═══════════════════════════════════════════════════════ */
const api = {
  interns:      async (): Promise<Intern[]>          => { try { const r = await apiClient.get("/interns/");               return Array.isArray(r.data) ? r.data : r.data.items || []; } catch { return []; } },
  projects:     async (): Promise<Project[]>         => { try { const r = await apiClient.get("/projects/");              return Array.isArray(r.data) ? r.data : r.data.items || []; } catch { return []; } },
  tasks:        async (): Promise<Task[]>            => { try { const r = await apiClient.get("/tasks/");                 return Array.isArray(r.data) ? r.data : r.data.items || []; } catch { return []; } },
  dsus:         async (): Promise<DSU[]>             => { try { const r = await apiClient.get("/dsu-entries/");           return Array.isArray(r.data) ? r.data : r.data.items || []; } catch { return []; } },
  scrumMasters: async (): Promise<ScrumMasterUser[]> => { try { const r = await apiClient.get("/users?role=scrum_master"); return Array.isArray(r.data) ? r.data : r.data.items || []; } catch { return []; } },
  internUsers:  async (): Promise<UserSummary[]>     => { try { const r = await apiClient.get("/users?role=intern");      return Array.isArray(r.data) ? r.data : r.data.items || []; } catch { return []; } },
  attendance:   async (date: string) => {
    try {
      const r = await apiClient.get("/office-attendance", { params: { date } });
      return (Array.isArray(r.data) ? r.data : r.data.items || []) as Array<{ internId?: string; status?: string }>;
    } catch { return []; }
  },
  markAttendance: (internId: string, date: string, status: string) =>
    apiClient.post("/office-attendance", { internId, date, status }),
};

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
const getInitials    = (n: string) => n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const getAvatarColor = (n: string) => AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length];
const getWorkMode    = (dsu?: DSU): WorkModeType | undefined => dsu?.workMode || dsu?.work_mode;

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════════════ */
const Counter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0) { setCount(0); return; }
    let n = 0;
    const inc = value / (700 / 16);
    const t = setInterval(() => { n += inc; if (n >= value) { setCount(value); clearInterval(t); } else setCount(Math.floor(n)); }, 16);
    return () => clearInterval(t);
  }, [value]);
  return <span>{count}</span>;
};

/* ═══════════════════════════════════════════════════════
   TASK ROW
═══════════════════════════════════════════════════════ */
const TaskRow = ({ task, isCenter }: { task: Task; isCenter: boolean }) => {
  const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.open;
  return (
    <div className="flex items-start gap-2 mb-2 last:mb-0">
      <span className="w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0" style={{ background: cfg.dot }} />
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-medium leading-snug line-clamp-2 ${isCenter ? "text-white/88" : "text-gray-700"}`}>
          {task.title}
        </p>
        <span
          className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
          style={{ background: isCenter ? "rgba(255,255,255,0.13)" : cfg.bg, color: isCenter ? "#fff" : cfg.color }}
        >
          {cfg.label}
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   DSU SECTION  (Yesterday / Today)
═══════════════════════════════════════════════════════ */
const DSUSection = ({
  label, dsuText, tasks, isCenter, accentBg, emptyMessage,
}: {
  label: string; dsuText?: string; tasks: Task[];
  isCenter: boolean; accentBg: string; emptyMessage: string;
}) => {
  const hasContent = dsuText?.trim() || tasks.length > 0;
  return (
    <div>
      <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1.5 ${isCenter ? "text-white/40" : "text-gray-400"}`}>
        {label}
      </p>
      <div className="rounded-xl p-3 min-h-[72px]" style={{ background: accentBg }}>
        {!hasContent ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[48px] gap-1">
            <FileX size={13} className={isCenter ? "text-white/20" : "text-gray-300"} />
            <p className={`text-[10px] italic text-center ${isCenter ? "text-white/28" : "text-gray-300"}`}>
              {emptyMessage}
            </p>
          </div>
        ) : dsuText?.trim() ? (
          <p className={`text-xs leading-relaxed line-clamp-4 ${isCenter ? "text-white/80" : "text-gray-600"}`}>
            {dsuText}
          </p>
        ) : (
          tasks.slice(0, 3).map(t => <TaskRow key={t._id} task={t} isCenter={isCenter} />)
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   WORK MODE BADGE
═══════════════════════════════════════════════════════ */
const WorkModeBadge = ({ mode, isCenter }: { mode: WorkModeType; isCenter: boolean }) => {
  const cfg = WORK_MODE_CONFIG[mode];
  const { Icon } = cfg;
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0"
      style={{ background: isCenter ? "rgba(255,255,255,0.15)" : cfg.lightBg, color: isCenter ? "#fff" : cfg.lightColor }}
    >
      <Icon size={10} />{cfg.label}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════ */
const EmptyState = ({
  Icon, title, subtitle,
}: { Icon: React.FC<{ size?: number; className?: string }>; title: string; subtitle: string }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
      <Icon size={28} className="text-gray-300" />
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
const DSUBoard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin      = user?.role === "admin";
  const isAuthorized = user?.role === "admin" || user?.role === "scrum_master";

  const [interns,      setInterns]      = useState<Intern[]>([]);
  const [internUsers,  setInternUsers]  = useState<UserSummary[]>([]);
  const [scrumMasters, setScrumMasters] = useState<ScrumMasterUser[]>([]);
  const [projects,     setProjects]     = useState<Project[]>([]);
  const [tasks,        setTasks]        = useState<Task[]>([]);
  const [dsus,         setDsus]         = useState<DSU[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "present" | "absent">>({});

  const [selectedDate,  setSelectedDate]  = useState(new Date().toISOString().split("T")[0]);
  const [batchFilter,   setBatchFilter]   = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [searchQuery,   setSearchQuery]   = useState("");
  const [startIndex,    setStartIndex]    = useState(0);
  const CARDS_VISIBLE = 3;

  const [exportOpen, setExportOpen] = useState(false);
  const [fromDate,   setFromDate]   = useState("");
  const [toDate,     setToDate]     = useState("");

  /* ── load attendance ── */
  const loadAttendance = async (date: string) => {
    const records = await api.attendance(date);
    const map: Record<string, "present" | "absent"> = {};
    records.forEach(r => { if (r?.internId && (r.status === "present" || r.status === "absent")) map[r.internId] = r.status; });
    setAttendanceMap(map);
  };

  /* ── load all data ── */
  const loadData = async () => {
    setLoading(true);
    try {
      const [i, p, t, d, sm, iu] = await Promise.all([
        api.interns(), api.projects(), api.tasks(),
        api.dsus(), api.scrumMasters(), api.internUsers(),
      ]);
      setInterns(i); setProjects(p); setTasks(t);
      setDsus(d); setScrumMasters(sm); setInternUsers(iu);
      await loadAttendance(selectedDate);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadAttendance(selectedDate); }, [selectedDate]);

  /* ── board members ── */
  const normalizeEmail = (e: string) => e.toLowerCase().trim();
  const internsByEmail = useMemo(
    () => new Map(interns.map(i => [normalizeEmail(i.email), i])),
    [interns]
  );

  const allBoardMembers = useMemo<BoardMember[]>(() => [
    ...internUsers.map(u => {
      const m = internsByEmail.get(normalizeEmail(u.email));
      return { _id: m?._id || u.id, name: u.name, email: u.email, role: "intern" as const, domain: m?.domain, currentProject: m?.currentProject, batch: m?.batch || u.batch };
    }),
    ...scrumMasters.map(u => {
      const m = internsByEmail.get(normalizeEmail(u.email));
      return { _id: m?._id || u.id, name: u.name, email: u.email, role: "scrum_master" as const, domain: "Scrum Master", currentProject: "Leadership" };
    }),
  ], [internUsers, scrumMasters, internsByEmail]);

  const batches = useMemo(
    () => Array.from(new Set(allBoardMembers.map(m => m.batch).filter(Boolean))) as string[],
    [allBoardMembers]
  );

  /* ── filtered members ── */
  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allBoardMembers.filter(m => {
      if (batchFilter   !== "all" && m.batch          !== batchFilter)   return false;
      if (projectFilter !== "all" && m.currentProject !== projectFilter) return false;
      if (q && !m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allBoardMembers, batchFilter, projectFilter, searchQuery]);

  useEffect(() => { setStartIndex(0); }, [batchFilter, projectFilter, searchQuery, selectedDate]);

  /* ── KPI counts ── */
  const kpiCounts = useMemo(() => {
    const day = tasks.filter(t => t.created_at?.startsWith(selectedDate));
    return {
      open:        day.filter(t => t.status === "open").length,
      in_progress: day.filter(t => t.status === "in_progress").length,
      done:        day.filter(t => t.status === "completed" || t.status === "done").length,
      blocked:     day.filter(t => t.status === "blocked").length,
    };
  }, [tasks, selectedDate]);

  /* ── yesterday date ── */
  const yesterdayStr = useMemo(() => {
    const d = new Date(selectedDate); d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }, [selectedDate]);

  const getDSU   = (id: string, date: string) => dsus.find(d => d.internId === id && d.date?.startsWith(date));
  const getTasks = (id: string, date: string) => tasks.filter(t => t.internId === id && t.created_at?.startsWith(date));

  /* ── attendance (optimistic) ── */
  const markAttendance = async (memberId: string, status: "present" | "absent") => {
    setAttendanceMap(prev => ({ ...prev, [memberId]: status }));
    try { await api.markAttendance(memberId, selectedDate, status); }
    catch { setAttendanceMap(prev => { const n = { ...prev }; delete n[memberId]; return n; }); }
  };

  /* ── carousel ── */
  const padded = [null, ...filteredMembers, null] as (BoardMember | null)[];
  const display = [...padded.slice(startIndex, startIndex + CARDS_VISIBLE)];
  while (display.length < CARDS_VISIBLE) display.push(null);
  const canLeft  = startIndex > 0;
  const canRight = startIndex + CARDS_VISIBLE < padded.length;
  const dots     = Math.max(0, padded.length - CARDS_VISIBLE + 1);

  /* ── export ── */
  const exportCSV = () => {
    const rows = tasks.filter(t => {
      if (fromDate && new Date(t.created_at) < new Date(fromDate)) return false;
      if (toDate   && new Date(t.created_at) > new Date(toDate))   return false;
      if (projectFilter !== "all" && t.project !== projectFilter)   return false;
      return true;
    }).map(t => {
      const intern = interns.find(i => i._id === t.internId);
      return [intern?.name || "Unknown", t.title, t.project, t.status, t.priority, t.dueDate, t.created_at];
    });
    const csv = [["Intern","Task","Project","Status","Priority","Due Date","Created"], ...rows]
      .map(r => r.map(v => `"${v ?? ""}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: `DSU_Report_${selectedDate}.csv` });
    a.click(); setExportOpen(false);
  };

  /* ═══ RENDER: LOADING ═══ */
  if (loading) return (
    <DashboardLayout>
      <div className="space-y-5 p-6">
        <div className="flex items-center justify-between"><Skeleton className="h-7 w-48 rounded-lg" /><div className="flex gap-2"><Skeleton className="h-9 w-24 rounded-lg" /><Skeleton className="h-9 w-24 rounded-lg" /></div></div>
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        <Skeleton className="h-16 rounded-2xl" />
        <div className="flex gap-5 justify-center">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[500px] w-80 rounded-2xl flex-none" />)}</div>
      </div>
    </DashboardLayout>
  );

  /* ═══ RENDER: UNAUTHORIZED ═══ */
  if (!isAuthorized) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0F0E47] to-[#272757] p-6 text-center">
      <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mb-6"><Lock size={40} color="#ef4444" /></div>
      <h1 className="text-2xl font-bold text-white mb-3">Access Restricted</h1>
      <p className="text-white/60 max-w-sm text-sm leading-relaxed">The DSU Board is only accessible to Scrum Masters and Administrators.</p>
    </div>
  );

  /* ═══ KPI CONFIG ═══ */
  const kpiCards = [
    { label: "Open",        value: kpiCounts.open,        Icon: Users,         g: "from-blue-50 to-blue-100",   b: "border-blue-200",   ib: "bg-blue-100",   ic: "#2563eb", tc: "text-blue-700"  },
    { label: "In Progress", value: kpiCounts.in_progress, Icon: Clock,         g: "from-amber-50 to-amber-100", b: "border-amber-200",  ib: "bg-amber-100",  ic: "#d97706", tc: "text-amber-700" },
    { label: "Done",        value: kpiCounts.done,        Icon: CheckCircle2,  g: "from-green-50 to-green-100", b: "border-green-200",  ib: "bg-green-100",  ic: "#16a34a", tc: "text-green-700" },
    { label: "Blocked",     value: kpiCounts.blocked,     Icon: AlertTriangle, g: "from-red-50 to-red-100",     b: "border-red-200",    ib: "bg-red-100",    ic: "#dc2626", tc: "text-red-700"   },
  ];

  const hasDateData =
    tasks.some(t => t.created_at?.startsWith(selectedDate)) ||
    dsus.some(d => d.date?.startsWith(selectedDate));

  /* ═══ MAIN RENDER ═══ */
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8fafc]">

        {/* TOP BAR */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-[#0F0E47]">DSU Board</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <RefreshCw size={13} /> Refresh
            </button>
            {isAdmin && (
              <button onClick={() => setExportOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#0F0E47] to-[#505081] rounded-lg hover:opacity-90 transition">
                <Download size={13} /> Export
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* KPI CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ scale: 1.02 }}
                className={`bg-gradient-to-br ${k.g} border ${k.b} rounded-2xl p-4 flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-xl ${k.ib} flex items-center justify-center flex-shrink-0`}>
                  <k.Icon size={18} color={k.ic} />
                </div>
                <div>
                  <p className={`text-2xl font-bold leading-none ${k.tc}`}><Counter value={k.value} /></p>
                  <p className="text-[11px] font-semibold text-gray-500 mt-1">{k.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FILTERS */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Date</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#0F0E47] focus:outline-none focus:ring-2 focus:ring-[#0F0E47]/20 bg-white" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Batch</label>
                <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#0F0E47] focus:outline-none focus:ring-2 focus:ring-[#0F0E47]/20 bg-white cursor-pointer">
                  <option value="all">All Batches</option>
                  {batches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Project</label>
                <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#0F0E47] focus:outline-none focus:ring-2 focus:ring-[#0F0E47]/20 bg-white cursor-pointer">
                  <option value="all">All Projects</option>
                  {projects.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input type="text" placeholder="Name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm text-[#0F0E47] focus:outline-none focus:ring-2 focus:ring-[#0F0E47]/20 bg-white" />
                </div>
              </div>
            </div>
          </div>

          {/* MEMBER COUNT + CLEAR */}
          <div className="flex items-center gap-2 px-1">
            <Users size={13} className="text-gray-400" />
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-[#0F0E47]">{filteredMembers.length}</span> member{filteredMembers.length !== 1 ? "s" : ""}
              {(batchFilter !== "all" || projectFilter !== "all" || searchQuery) && (
                <button onClick={() => { setBatchFilter("all"); setProjectFilter("all"); setSearchQuery(""); }}
                  className="ml-2 text-[#505081] underline underline-offset-2 hover:text-[#0F0E47] text-xs">
                  Clear filters
                </button>
              )}
            </p>
          </div>

          {/* EDGE CASE: no data for selected date */}
          {filteredMembers.length > 0 && !hasDateData && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <CalendarX size={15} className="text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                No DSU entries or tasks found for <strong>{new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong>.
                Cards will show placeholder content.
              </p>
            </div>
          )}

          {/* EDGE CASE: filters return nothing */}
          {filteredMembers.length === 0 && (
            <EmptyState
              Icon={SlidersHorizontal}
              title="No members match your filters"
              subtitle="Try adjusting the batch, project, or search query"
            />
          )}

          {/* CAROUSEL */}
          {filteredMembers.length > 0 && (
            <div className="relative px-12">

              <button onClick={() => { setStartIndex(i => Math.max(0, i - 1)); }} disabled={!canLeft}
                className={`absolute left-0 top-[230px] w-10 h-10 rounded-full bg-gradient-to-br from-[#0F0E47] to-[#505081] text-white flex items-center justify-center shadow-lg z-10 transition ${!canLeft ? "opacity-25 cursor-not-allowed" : "hover:opacity-90"}`}>
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-5 justify-center items-stretch">
                <AnimatePresence mode="popLayout">
                  {display.map((member, idx) => {
                    if (!member) return <div key={`empty-${idx}`} className="flex-none w-80" />;

                    const isCenter   = idx === 1;
                    const todayDSU   = getDSU(member._id, selectedDate);
                    const yestDSU    = getDSU(member._id, yesterdayStr);
                    const todayTasks = getTasks(member._id, selectedDate);
                    const yestTasks  = getTasks(member._id, yesterdayStr);
                    const attendance = attendanceMap[member._id];
                    const workMode   = getWorkMode(todayDSU);
                    const hasDSU     = !!todayDSU;

                    const yestBg  = isCenter ? "rgba(255,255,255,0.07)" : "#f8fafc";
                    const todayBg = isCenter ? "rgba(168,85,247,0.14)"  : "#f0f9ff";

                    return (
                      <motion.div key={member._id}
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: isCenter ? 1.02 : 1 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        transition={{ duration: 0.22 }}
                        className={`flex-none w-80 rounded-2xl flex flex-col overflow-hidden ${
                          isCenter
                            ? "bg-gradient-to-br from-[#0F0E47] to-[#272757] shadow-2xl shadow-[#0F0E47]/25"
                            : "bg-white border border-gray-200 shadow-sm"
                        }`}
                      >
                        {/* HEADER */}
                        <div className="p-4 pb-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                style={{ background: getAvatarColor(member.name) }}>
                                {getInitials(member.name)}
                              </div>
                              <div className="min-w-0">
                                <p className={`font-semibold text-sm truncate ${isCenter ? "text-white" : "text-[#0F0E47]"}`}>
                                  {member.name}
                                </p>
                                <p className={`text-[11px] truncate ${isCenter ? "text-white/50" : "text-gray-400"}`}>
                                  {member.role === "scrum_master" ? "Scrum Master" : member.domain || "Intern"}
                                  {member.currentProject ? ` · ${member.currentProject}` : ""}
                                </p>
                              </div>
                            </div>

                            {/* WORK MODE */}
                            {workMode
                              ? <WorkModeBadge mode={workMode} isCenter={isCenter} />
                              : <span className={`text-[10px] px-2 py-1 rounded-full font-medium flex-shrink-0 ${isCenter ? "bg-white/10 text-white/35" : "bg-gray-100 text-gray-400"}`}>
                                  No mode
                                </span>
                            }
                          </div>

                          {/* ATTENDANCE ROW */}
                          <div className={`mt-3 mb-3 flex items-center justify-between px-3 py-2 rounded-xl border ${
                            attendance === "present"
                              ? isCenter ? "border-green-500/30 bg-green-500/15" : "border-green-200 bg-green-50"
                              : attendance === "absent"
                              ? isCenter ? "border-red-500/30 bg-red-500/15"     : "border-red-200 bg-red-50"
                              : isCenter ? "border-white/10 bg-white/5"          : "border-gray-200 bg-gray-50"
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                attendance === "present" ? "bg-green-400"
                                : attendance === "absent"  ? "bg-red-400"
                                : "bg-gray-300 animate-pulse"
                              }`} />
                              <span className={`text-xs font-semibold ${
                                attendance === "present"
                                  ? isCenter ? "text-green-300"  : "text-green-700"
                                  : attendance === "absent"
                                  ? isCenter ? "text-red-300"    : "text-red-600"
                                  : isCenter ? "text-white/35"   : "text-gray-400"
                              }`}>
                                {attendance === "present" ? "Present"
                                 : attendance === "absent" ? "Absent"
                                 : "Not Marked"}
                              </span>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              hasDSU
                                ? isCenter ? "bg-white/15 text-white/70" : "bg-blue-50 text-blue-600 border border-blue-100"
                                : isCenter ? "bg-white/8 text-white/28"  : "bg-gray-100 text-gray-400"
                            }`}>
                              {hasDSU ? "DSU ✓" : "No DSU"}
                            </span>
                          </div>
                        </div>

                        {/* DIVIDER */}
                        <div className={`mx-4 h-px ${isCenter ? "bg-white/10" : "bg-gray-100"}`} />

                        {/* DSU CONTENT */}
                        <div className="p-4 flex-1 space-y-3">
                          <DSUSection
                            label="Yesterday"
                            dsuText={yestDSU?.yesterday}
                            tasks={yestTasks}
                            isCenter={isCenter}
                            accentBg={yestBg}
                            emptyMessage="No update submitted"
                          />
                          <DSUSection
                            label="Today"
                            dsuText={todayDSU?.today}
                            tasks={todayTasks}
                            isCenter={isCenter}
                            accentBg={todayBg}
                            emptyMessage="No DSU for today yet"
                          />

                          {/* Blockers */}
                          {todayDSU?.blockers?.trim() && (
                            <div>
                              <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1.5 ${isCenter ? "text-red-300/70" : "text-red-400"}`}>
                                Blocker
                              </p>
                              <div className={`rounded-xl p-2.5 ${isCenter ? "bg-red-500/15" : "bg-red-50 border border-red-100"}`}>
                                <p className={`text-xs leading-relaxed line-clamp-2 ${isCenter ? "text-red-200" : "text-red-700"}`}>
                                  {todayDSU.blockers}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ATTENDANCE BUTTONS */}
                        <div className="p-4 pt-2 flex gap-2">
                          <button onClick={() => markAttendance(member._id, "present")}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                              attendance === "present"
                                ? "bg-green-500 text-white shadow-md shadow-green-500/25"
                                : isCenter
                                  ? "bg-white/10 text-white/60 hover:bg-green-500 hover:text-white"
                                  : "bg-gray-100 text-gray-500 hover:bg-green-500 hover:text-white"
                            }`}>
                            <CheckCircle size={13} /> Present
                          </button>
                          <button onClick={() => markAttendance(member._id, "absent")}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                              attendance === "absent"
                                ? "bg-red-500 text-white shadow-md shadow-red-500/25"
                                : isCenter
                                  ? "bg-white/10 text-white/60 hover:bg-red-500 hover:text-white"
                                  : "bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white"
                            }`}>
                            <XCircle size={13} /> Absent
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <button onClick={() => { setStartIndex(i => Math.min(padded.length - CARDS_VISIBLE, i + 1)); }} disabled={!canRight}
                className={`absolute right-0 top-[230px] w-10 h-10 rounded-full bg-gradient-to-br from-[#0F0E47] to-[#505081] text-white flex items-center justify-center shadow-lg z-10 transition ${!canRight ? "opacity-25 cursor-not-allowed" : "hover:opacity-90"}`}>
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* DOT PAGINATION */}
          {dots > 1 && (
            <div className="flex justify-center gap-1.5 pt-1">
              {Array.from({ length: dots }).map((_, i) => (
                <button key={i} onClick={() => setStartIndex(i)}
                  className={`rounded-full transition-all duration-200 ${i === startIndex ? "w-5 h-2 bg-[#0F0E47]" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"}`} />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* EXPORT MODAL */}
      <AnimatePresence>
        {exportOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setExportOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#0F0E47]">Export Report</h2>
                <button onClick={() => setExportOpen(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"><X size={16} /></button>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">From Date</label>
                  <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F0E47]/20" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">To Date</label>
                  <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F0E47]/20" />
                </div>
                <p className="text-xs text-gray-400">Active project & member filters will be applied.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setExportOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button onClick={exportCSV} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0F0E47] to-[#505081] text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition">
                  <Download size={14} /> Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default DSUBoard;
