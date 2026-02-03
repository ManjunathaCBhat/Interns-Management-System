import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, getStatusColor, getStatusBgColor } from '@/config/colors';

// --- Interfaces ---
interface Intern {
  _id: string;
  name: string;
  domain: string;
  status: 'active' | 'training' | 'onboarding' | 'completed' | 'dropped';
  internType: 'project' | 'rs';
  isPaid: boolean;
  currentProject: string;
  mentor: string;
  taskCount: number;
  completedTasks: number;
  dsuStreak: number;
}

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
  activeInterns: number;
  projectInterns: number;
  rsInterns: number;
  paidInterns: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletion: number;
  submittedDSUs: number;
  pendingDSUs: number;
  dsuCompletion: number;
  pendingPTOs: number;
  approvedPTOs: number;
  totalBatches: number;
  activeBatches: number;
  upcomingBatches: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInterns, setRecentInterns] = useState<Intern[]>([]);
  const [blockedDSUs, setBlockedDSUs] = useState<DSUEntry[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [statsResponse, internsResponse, dsusResponse] = await Promise.all([
        apiClient.get('/admin/dashboard/stats'),
        apiClient.get('/admin/dashboard/recent-interns?limit=5'),
        apiClient.get('/admin/dashboard/blocked-dsus?limit=5').catch(() => ({ data: [] })),
      ]);

      setStats(statsResponse.data);
      setRecentInterns(internsResponse.data);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

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
            <h1 className="text-xl font-bold text-[#1e1145]">Admin</h1>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Interns" 
            value={stats?.totalInterns || 0} 
            sub={`${stats?.activeInterns || 0} active`} 
            icon={<Users className="text-white" />} 
            color={COLORS.primary.purple}
          />
          <StatCard 
            title="DSU Completion" 
            value={`${stats?.dsuCompletion || 0}%`} 
            sub={`${stats?.submittedDSUs || 0} submitted today`} 
            icon={<CheckCircle className="text-white" />} 
            color={(stats?.dsuCompletion || 0) > 80 ? COLORS.status.success : COLORS.status.warning}
          />
          <StatCard 
            title="Project / RS" 
            value={`${stats?.projectInterns || 0} / ${stats?.rsInterns || 0}`} 
            sub="Intern Types" 
            icon={<Briefcase className="text-white" />} 
            color={COLORS.accent.pink}
          />
          <StatCard 
            title="Task Completion" 
            value={`${stats?.taskCompletion || 0}%`} 
            sub={`${stats?.completedTasks || 0}/${stats?.totalTasks || 0} tasks`} 
            icon={<Target className="text-white" />} 
            color={COLORS.primary.deepPurple}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DSU Status */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2"><Calendar size={20} style={{ color: COLORS.primary.purple }} /> Today's DSU Status</h2>
              <Link to="/admin/dsu-board" className="text-sm font-semibold flex items-center gap-1" style={{ color: COLORS.primary.purple }}>View Board <ArrowRight size={14} /></Link>
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

          {/* Recent Activity */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6"><Activity size={20} style={{ color: COLORS.primary.purple }} /> Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Award size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm">Pending PTO Requests</div>
                  <div className="text-xs text-slate-500">Awaiting approval</div>
                </div>
                <div className="text-lg font-bold text-orange-500">{stats?.pendingPTOs || 0}</div>
              </div>
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm">Approved PTOs</div>
                  <div className="text-xs text-slate-500">This month</div>
                </div>
                <div className="text-lg font-bold text-green-500">{stats?.approvedPTOs || 0}</div>
              </div>
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm">Active Batches</div>
                  <div className="text-xs text-slate-500">{stats?.upcomingBatches || 0} upcoming</div>
                </div>
                <div className="text-lg font-bold text-blue-500">{stats?.activeBatches || 0}</div>
              </div>
            </div>
          </section>
        </div>

        {/* Interns Table */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2"><Users size={20} style={{ color: COLORS.primary.purple }} /> Recent Interns</h2>
            <Link to="/admin/interns" className="text-sm font-semibold flex items-center gap-1" style={{ color: COLORS.primary.purple }}>View All <ArrowRight size={14} /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Intern</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Mentor</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {recentInterns.length > 0 ? (
                  recentInterns.map(intern => (
                    <tr key={intern._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-xs font-bold" style={{ backgroundColor: COLORS.primary.purple }}>{getInitials(intern.name)}</div>
                        <div>
                          <div className="font-bold text-slate-800">{intern.name}</div>
                          <div className="text-slate-400 text-xs">{intern.domain}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold uppercase text-xs" style={{ color: COLORS.primary.purple }}>{intern.internType}</td>
                      <td className="px-6 py-4 text-slate-600">{intern.currentProject}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: getStatusBgColor(intern.status), color: getStatusColor(intern.status) }}>
                          {intern.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{intern.mentor}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No interns found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

// --- Sub-components ---
const StatCard = ({ title, value, sub, icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-1 transition-transform">
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="text-3xl font-bold text-[#1e1145]">{value}</div>
        <div className="text-sm font-medium text-slate-500">{title}</div>
      </div>
      <div className="p-3 rounded-xl shadow-lg shadow-black/5" style={{ backgroundColor: color }}>{icon}</div>
    </div>
    <div className="text-xs text-slate-400 font-medium">{sub}</div>
  </div>
);

export default AdminDashboard;