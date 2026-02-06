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
  Layers,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, getStatusColor, getStatusBgColor } from '@/config/colors';

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats and blocked DSUs in parallel
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- Helper Functions ---
  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

  // Loading Skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <header className="bg-white border-b p-4 rounded-lg">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
                </div>
                <div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            <RefreshCw size={16} /> Retry
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
            onClick={fetchDashboardData}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
            style={{ backgroundColor: COLORS.primary.purple }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </header>

        {/* Live Stats Grid - 6 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ClickableStatCard 
            title="Total Interns" 
            value={stats?.totalInterns || 0} 
            sub="Active interns" 
            icon={<Users className="text-white" />} 
            color={COLORS.primary.purple}
            onClick={() => navigate('/admin/interns')}
          />
          <ClickableStatCard 
            title="DSU Completion" 
            value={`${stats?.dsuCompletion || 0}%`} 
            sub={`${stats?.submittedDSUs || 0} submitted today`} 
            icon={<CheckCircle className="text-white" />} 
            color={(stats?.dsuCompletion || 0) > 80 ? COLORS.status.success : COLORS.status.warning}
            onClick={() => navigate('/admin/dsu-board')}
          />
          <ClickableStatCard 
            title="Intern Types" 
            value={`${stats?.projectInterns || 0} / ${stats?.rsInterns || 0}`} 
            sub="Project / RS" 
            icon={<Briefcase className="text-white" />} 
            color={COLORS.accent.pink}
            onClick={() => navigate('/admin/interns')}
          />
          <ClickableStatCard 
            title="Task Completion" 
            value={`${stats?.taskCompletion || 0}%`} 
            sub={`${stats?.completedTasks || 0}/${stats?.totalTasks || 0} tasks`} 
            icon={<Target className="text-white" />} 
            color={COLORS.primary.deepPurple}
            onClick={() => navigate('/admin/dsu-board')}
          />
          <ClickableStatCard 
            title="Pending PTO" 
            value={stats?.pendingPTOs || 0} 
            sub="Awaiting approval" 
            icon={<Calendar className="text-white" />} 
            color={COLORS.status.warning}
            onClick={() => navigate('/admin/pto-requests')}
          />
          <ClickableStatCard 
            title="Approved PTO" 
            value={stats?.approvedPTOs || 0} 
            sub="This month" 
            icon={<Award className="text-white" />} 
            color={COLORS.status.success}
            onClick={() => navigate('/admin/pto-requests')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DSU Status - KEPT */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2"><Calendar size={20} style={{ color: COLORS.primary.purple }} /> Today's DSU Status</h2>
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
                <div className="text-2xl font-bold text-green-600">{stats?.submittedDSUs || 0}</div>
                <div className="text-xs text-slate-500 font-bold uppercase">Submitted</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats?.pendingDSUs || 0}</div>
                <div className="text-xs text-slate-500 font-bold uppercase">Pending</div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-red-600">{blockedDSUs.length}</div>
                <div className="text-xs text-slate-500 font-bold uppercase">Blocked</div>
              </div>
            </div>
            {blockedDSUs.length > 0 ? (
              blockedDSUs.map(block => (
                <div key={block._id} className="flex gap-4 p-3 bg-red-50/50 rounded-lg border border-red-100 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold">{getInitials(block.internName || '')}</div>
                  <div>
                    <div className="font-bold text-slate-800">{block.internName || 'Unknown'}</div>
                    <div className="text-sm text-slate-500 truncate">{block.blockers}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">No blockers reported today</p>
            )}
          </section>

          {/* Quick Stats - NEW */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6"><Activity size={20} style={{ color: COLORS.primary.purple }} /> Quick Stats</h2>
            <div className="space-y-4">
              <QuickStatRow 
                icon={<Award size={20} className="text-orange-600" />}
                bgColor="bg-orange-50"
                label="Pending PTO Requests"
                sublabel="Awaiting approval"
                value={stats?.pendingPTOs || 0}
                valueColor="text-orange-500"
                onClick={() => navigate('/admin/pto-requests')}
              />
              <QuickStatRow 
                icon={<CheckCircle size={20} className="text-green-600" />}
                bgColor="bg-green-50"
                label="Approved PTOs"
                sublabel="This month"
                value={stats?.approvedPTOs || 0}
                valueColor="text-green-500"
                onClick={() => navigate('/admin/pto-requests')}
              />
              <QuickStatRow 
                icon={<Layers size={20} className="text-blue-600" />}
                bgColor="bg-blue-50"
                label="Active Batches"
                sublabel="Currently running"
                value={stats?.activeBatches || 0}
                valueColor="text-blue-500"
                onClick={() => navigate('/admin/batch-management')}
              />
            </div>
          </section>
        </div>

        {/* REMOVED: Recent Interns Table Section */}
      </div>
    </DashboardLayout>
  );
};

// --- Clickable Stat Card Component ---
const ClickableStatCard = ({ title, value, sub, icon, color, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer"
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="text-3xl font-bold text-[#1e1145]">{value}</div>
        <div className="text-sm font-medium text-slate-500">{title}</div>
      </div>
      <div className="p-3 rounded-xl shadow-lg shadow-black/5" style={{ backgroundColor: color }}>
        {icon}
      </div>
    </div>
    <div className="text-xs text-slate-400 font-medium">{sub}</div>
  </div>
);

// --- Quick Stat Row Component ---
const QuickStatRow = ({ icon, bgColor, label, sublabel, value, valueColor, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-4 p-3 ${bgColor} rounded-xl hover:shadow-md transition-all cursor-pointer`}
  >
    <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
    <div className="flex-1">
      <div className="font-bold text-slate-800 text-sm">{label}</div>
      <div className="text-xs text-slate-500">{sublabel}</div>
    </div>
    <div className={`text-lg font-bold ${valueColor}`}>{value}</div>
  </div>
);

export default AdminDashboard;