import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle,
  Calendar,
  RefreshCw,
  ArrowRight,
  Target,
  ClipboardList,
  AlertTriangle,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';

// --- Interfaces ---
interface DashboardStats {
  totalInterns: number;
  activeInterns: number;
  submittedDSUs: number;
  pendingDSUs: number;
  dsuCompletion: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletion: number;
}

interface RecentIntern {
  _id: string;
  name: string;
  domain: string;
  status: string;
  currentProject: string;
}

interface RecentDSU {
  _id: string;
  internId: string;
  internName?: string;
  date: string;
  blockers: string;
  status: string;
}

// --- Stat Card Component ---
const StatCard: React.FC<{
  title: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, sub, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition-all hover:shadow-md">
    <div className={`${color} p-4 rounded-xl`}>{icon}</div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  </div>
);

const ScrumMasterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalInterns: 0,
    activeInterns: 0,
    submittedDSUs: 0,
    pendingDSUs: 0,
    dsuCompletion: 0,
    totalTasks: 0,
    completedTasks: 0,
    taskCompletion: 0,
  });
  const [recentInterns, setRecentInterns] = useState<RecentIntern[]>([]);
  const [recentDSUs, setRecentDSUs] = useState<RecentDSU[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const statsResponse = await apiClient.get('/admin/dashboard/stats');
      setStats(statsResponse.data);

      // Fetch recent interns
      const internsResponse = await apiClient.get('/admin/dashboard/recent-interns?limit=5');
      setRecentInterns(internsResponse.data);

      // Fetch recent DSUs
      const dsusResponse = await apiClient.get('/admin/dashboard/recent-dsus?limit=5');
      setRecentDSUs(dsusResponse.data);
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
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#22c55e',
      training: '#3b82f6',
      onboarding: '#eab308',
      completed: '#64748b',
      dropped: '#ef4444',
    };
    return colors[status] || '#94a3b8';
  };

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
            <h1 className="text-xl font-bold text-[#1e1145]">Scrum Master Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 bg-purple-500/10 text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-500/20 transition-all"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Interns"
            value={stats.activeInterns}
            sub={`${stats.totalInterns} total`}
            icon={<Users className="text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="DSU Completion"
            value={`${stats.dsuCompletion}%`}
            sub={`${stats.submittedDSUs} submitted today`}
            icon={<CheckCircle className="text-white" />}
            color={stats.dsuCompletion > 80 ? 'bg-green-500' : 'bg-yellow-500'}
          />
          <StatCard
            title="Task Completion"
            value={`${stats.taskCompletion}%`}
            sub={`${stats.completedTasks}/${stats.totalTasks} tasks`}
            icon={<Target className="text-white" />}
            color="bg-cyan-500"
          />
          <StatCard
            title="Pending DSUs"
            value={stats.pendingDSUs}
            sub="Need attention"
            icon={<Calendar className="text-white" />}
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Interns */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users size={20} className="text-purple-600" /> Team Members
              </h2>
              <Link
                to="/scrum-master/interns"
                className="text-blue-600 text-sm font-semibold flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentInterns.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No interns found</p>
              ) : (
                recentInterns.map((intern) => (
                  <div
                    key={intern._id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ backgroundColor: getStatusColor(intern.status) }}
                      >
                        {getInitials(intern.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{intern.name}</p>
                        <p className="text-xs text-slate-500">{intern.domain}</p>
                      </div>
                    </div>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                      style={{
                        backgroundColor: `${getStatusColor(intern.status)}20`,
                        color: getStatusColor(intern.status),
                      }}
                    >
                      {intern.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Today's DSU Status */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ClipboardList size={20} className="text-purple-600" /> Today's DSU Status
              </h2>
              <Link
                to="/scrum-master/dsu-board"
                className="text-blue-600 text-sm font-semibold flex items-center gap-1"
              >
                View Board <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentDSUs.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No DSU entries for today</p>
              ) : (
                recentDSUs.map((dsu) => (
                  <div
                    key={dsu._id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-semibold">
                        {getInitials(dsu.internName || 'UN')}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{dsu.internName || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">
                          {dsu.blockers ? '⚠️ Has blockers' : '✓ No blockers'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        dsu.status === 'submitted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {dsu.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ScrumMasterDashboard;
