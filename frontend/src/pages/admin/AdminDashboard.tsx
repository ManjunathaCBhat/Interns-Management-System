import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  CheckCircle,
  Calendar,
  RefreshCw,
  ArrowRight,
  Target,
  Activity,
  Award,
  AlertTriangle,
  Inbox,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS } from '@/config/colors';

// --- Interfaces ---
interface DSUEntry {
  _id: string;
  internId: string;
  internName?: string;
  date: string;
  blockers: string;
  status: string;
}

interface DashboardStats {
  totalInterns: number;
  dsuCompletion: number;
  submittedDSUs: number;
  pendingDSUs: number;
  projectInterns: number;
  rsInterns: number;
  taskCompletion: number;
  completedTasks: number;
  totalTasks: number;
  pendingPTOs: number;
  approvedPTOs: number;
  activeBatches: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [blockedDSUs, setBlockedDSUs] = useState<DSUEntry[]>([]);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      const [statsResponse, dsusResponse] = await Promise.all([
        apiClient.get('/admin/dashboard/stats'),
        apiClient.get('/admin/dashboard/blocked-dsus?limit=5').catch(() => ({ data: [] })),
      ]);

      setStats(statsResponse.data);
      setBlockedDSUs(dsusResponse.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
    return undefined;
  }, []);

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

  // ========== LOADING SKELETON ==========
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          {/* Header Skeleton */}
          <header className="bg-white border-b p-4 rounded-lg shadow-sm">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
          </header>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
                </div>
                <div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Bottom Sections Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-16 bg-slate-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <AlertTriangle className="h-16 w-16 text-red-500" />
          <h2 className="text-xl font-bold text-slate-800">Failed to Load Dashboard</h2>
          <p className="text-red-600 text-center max-w-md">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="flex items-center gap-2 rounded-lg bg-[#0F0E47] px-6 py-3 text-white hover:bg-[#272757] transition-colors font-semibold"
          >
            <RefreshCw size={18} /> Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ========== EMPTY STATE (No Stats) ==========
  if (!stats) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <Inbox className="h-16 w-16 text-slate-300" />
          <h2 className="text-xl font-bold text-slate-800">No Dashboard Data</h2>
          <p className="text-slate-500 text-center max-w-md">
            Dashboard statistics are not available at the moment.
          </p>
          <button
            onClick={() => fetchDashboardData()}
            className="flex items-center gap-2 rounded-lg bg-[#0F0E47] px-6 py-3 text-white hover:bg-[#272757] transition-colors font-semibold"
          >
            <RefreshCw size={18} /> Load Data
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        {/* Top Bar */}
        <header className="bg-white border-b p-4 flex items-center justify-between shadow-sm rounded-lg">
          <div>
            <h1 className="text-xl font-bold text-[#1e1145]">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, {user?.name}</p>
          </div>
          <button 
            onClick={() => fetchDashboardData()}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
            style={{ backgroundColor: COLORS.primary.purple }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </header>

        {/* Live Stats Grid - 6 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ClickableStatCard 
            title="Total Interns" 
            value={stats.totalInterns} 
            sub="Active interns" 
            icon={<Users className="text-white" />} 
            color={COLORS.primary.purple}
            onClick={() => navigate('/admin/interns')}
            isEmpty={stats.totalInterns === 0}
          />
          <ClickableStatCard 
            title="DSU Completion" 
            value={`${stats.dsuCompletion}%`} 
            sub={`${stats.submittedDSUs} submitted today`} 
            icon={<CheckCircle className="text-white" />} 
            color={stats.dsuCompletion > 80 ? COLORS.status.success : COLORS.status.warning}
            onClick={() => navigate('/admin/dsu-board')}
            isEmpty={stats.submittedDSUs === 0}
          />
          <ClickableStatCard 
            title="Intern Types" 
            value={`${stats.projectInterns} / ${stats.rsInterns}`} 
            sub="Project / RS" 
            icon={<Briefcase className="text-white" />} 
            color={COLORS.accent.pink}
            onClick={() => navigate('/admin/interns')}
            isEmpty={stats.projectInterns === 0 && stats.rsInterns === 0}
          />
          <ClickableStatCard 
            title="Task Completion" 
            value={`${stats.taskCompletion}%`} 
            sub={`${stats.completedTasks}/${stats.totalTasks} tasks`} 
            icon={<Target className="text-white" />} 
            color={COLORS.primary.deepPurple}
            onClick={() => navigate('/admin/dsu-board')}
            isEmpty={stats.totalTasks === 0}
          />
          <ClickableStatCard 
            title="Pending PTO" 
            value={stats.pendingPTOs} 
            sub="Awaiting approval" 
            icon={<Calendar className="text-white" />} 
            color={COLORS.status.warning}
            onClick={() => navigate('/admin/approvals')}
            isEmpty={stats.pendingPTOs === 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DSU Status */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Calendar size={20} style={{ color: COLORS.primary.purple }} /> Today's DSU Status
              </h2>
              <button 
                onClick={() => navigate('/admin/dsu-board')}
                className="text-sm font-semibold flex items-center gap-1 hover:underline cursor-pointer" 
                style={{ color: COLORS.primary.purple }}
              >
                View Board <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-600">{stats.submittedDSUs}</div>
                <div className="text-xs text-slate-500 font-bold uppercase">Submitted</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingDSUs}</div>
                <div className="text-xs text-slate-500 font-bold uppercase">Pending</div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-red-600">{blockedDSUs.length}</div>
                <div className="text-xs text-slate-500 font-bold uppercase">Blocked</div>
              </div>
            </div>
            
            {/* Empty State for Blocked DSUs */}
            {blockedDSUs.length > 0 ? (
              blockedDSUs.map(block => (
                <div key={block._id} className="flex gap-4 p-3 bg-red-50/50 rounded-lg border border-red-100 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold">
                    {getInitials(block.internName || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800">{block.internName || 'Unknown'}</div>
                    <div className="text-sm text-slate-500 truncate">{block.blockers}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mb-2" />
                <p className="text-slate-600 font-medium">No blockers reported today</p>
                <p className="text-sm text-slate-400">All interns are on track! 🎉</p>
              </div>
            )}
          </section>

          {/* Quick Stats */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Activity size={20} style={{ color: COLORS.primary.purple }} /> Quick Stats
            </h2>
            <div className="space-y-4">
              <QuickStatRow 
                icon={<Award size={20} className="text-orange-600" />}
                bgColor="bg-orange-50"
                label="Pending PTO Requests"
                sublabel="Awaiting approval"
                value={stats.pendingPTOs}
                valueColor="text-orange-500"
                onClick={() => navigate('/admin/approvals')}
                isEmpty={stats.pendingPTOs === 0}
              />
              <QuickStatRow 
                icon={<CheckCircle size={20} className="text-green-600" />}
                bgColor="bg-green-50"
                label="Approved PTOs"
                sublabel="This month"
                value={stats.approvedPTOs}
                valueColor="text-green-500"
                onClick={() => navigate('/admin/approvals')}
                isEmpty={stats.approvedPTOs === 0}
              />
              <QuickStatRow 
                icon={<Users size={20} className="text-blue-600" />}
                bgColor="bg-blue-50"
                label="Active Batches"
                sublabel="Currently running"
                value={stats.activeBatches}
                valueColor="text-blue-500"
                onClick={() => navigate('/admin/batch-management')}
                isEmpty={stats.activeBatches === 0}
              />
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

// --- Clickable Stat Card Component with Empty State ---
const ClickableStatCard = ({ title, value, sub, icon, color, onClick, isEmpty }: any) => (
  <div 
    onClick={onClick}
    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
  >
    {isEmpty && (
      <div className="absolute top-2 right-2">
        <Inbox className="h-4 w-4 text-slate-300" />
      </div>
    )}
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className={`text-2xl font-bold ${isEmpty ? 'text-slate-300' : 'text-[#1e1145]'}`}>
          {value}
        </div>
        <div className="text-xs font-semibold text-slate-500">{title}</div>
      </div>
      <div className="p-2 rounded-lg shadow-md shadow-black/5" style={{ backgroundColor: isEmpty ? '#e2e8f0' : color }}>
        {icon}
      </div>
    </div>
    <div className="text-[11px] text-slate-400 font-medium">{sub}</div>
  </div>
);

// --- Quick Stat Row Component with Empty State ---
const QuickStatRow = ({ icon, bgColor, label, sublabel, value, valueColor, onClick, isEmpty }: any) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-4 p-3 ${isEmpty ? 'bg-slate-50' : bgColor} rounded-xl hover:shadow-md transition-all cursor-pointer`}
  >
    <div className={`p-2 ${isEmpty ? 'bg-slate-200' : 'bg-white'} rounded-lg shadow-sm`}>
      {isEmpty ? <Inbox size={20} className="text-slate-400" /> : icon}
    </div>
    <div className="flex-1">
      <div className="font-bold text-slate-800 text-sm">{label}</div>
      <div className="text-xs text-slate-500">{isEmpty ? 'No data' : sublabel}</div>
    </div>
    <div className={`text-lg font-bold ${isEmpty ? 'text-slate-400' : valueColor}`}>{value}</div>
  </div>
);

export default AdminDashboard;