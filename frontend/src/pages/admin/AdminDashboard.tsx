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
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

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
  date: string;
  blockers: string;
  status: string;
}

// --- Mock Data ---
const MOCK_INTERNS: Intern[] = [
  { _id: '1', name: 'Priya Sharma', domain: 'Frontend', status: 'active', internType: 'project', isPaid: true, currentProject: 'Interns360', mentor: 'Rajesh Kumar', taskCount: 15, completedTasks: 12, dsuStreak: 5 },
  { _id: '2', name: 'Arjun Patel', domain: 'Backend', status: 'active', internType: 'rs', isPaid: false, currentProject: 'HR Portal', mentor: 'Sneha Reddy', taskCount: 12, completedTasks: 10, dsuStreak: 7 },
  { _id: '3', name: 'Karthik Nair', domain: 'Full Stack', status: 'training', internType: 'project', isPaid: true, currentProject: 'Cloud Migration', mentor: 'Amit Singh', taskCount: 8, completedTasks: 6, dsuStreak: 3 },
  { _id: '4', name: 'Rahul Verma', domain: 'DevOps', status: 'active', internType: 'project', isPaid: true, currentProject: 'Interns360', mentor: 'Rajesh Kumar', taskCount: 10, completedTasks: 9, dsuStreak: 6 },
  { _id: '5', name: 'Ananya Das', domain: 'Frontend', status: 'active', internType: 'rs', isPaid: false, currentProject: 'HR Portal', mentor: 'Sneha Reddy', taskCount: 14, completedTasks: 11, dsuStreak: 4 },
];

const MOCK_DSU_ENTRIES: DSUEntry[] = [
  { _id: 'd1', internId: '1', date: new Date().toISOString().split('T')[0], blockers: '', status: 'submitted' },
  { _id: 'd2', internId: '2', date: new Date().toISOString().split('T')[0], blockers: 'Need database credentials', status: 'submitted' },
];

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // --- Calculations ---
  const activeInterns = MOCK_INTERNS.filter(i => i.status === 'active');
  const todaysDSUs = MOCK_DSU_ENTRIES.filter(d => d.date === new Date().toISOString().split('T')[0]);
  const dsuCompletion = activeInterns.length > 0 ? Math.round((todaysDSUs.length / activeInterns.length) * 100) : 0;
  const blockedInterns = todaysDSUs.filter(d => d.blockers.trim() !== '');

  // --- Helper Functions ---
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { active: '#22c55e', training: '#3b82f6', onboarding: '#eab308', completed: '#64748b', dropped: '#ef4444' };
    return colors[status] || '#94a3b8';
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#1e1145] text-white">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        {/* Top Bar */}
        <header className="bg-white border-b p-4 flex items-center justify-between shadow-sm rounded-lg">
          <h1 className="text-xl font-bold text-[#1e1145]">Admin Dashboard</h1>
          <button className="flex items-center gap-2 bg-purple-500/10 text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-500/20 transition-all">
            <RefreshCw size={16} /> Refresh
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Interns" value={MOCK_INTERNS.length} sub={`${activeInterns.length} active`} icon={<Users className="text-white" />} color="bg-blue-500" />
          <StatCard title="DSU Completion" value={`${dsuCompletion}%`} sub={`${todaysDSUs.length} submitted today`} icon={<CheckCircle className="text-white" />} color={dsuCompletion > 80 ? 'bg-green-500' : 'bg-yellow-500'} />
          <StatCard title="Project / RS" value={`${MOCK_INTERNS.filter(i => i.internType === 'project').length} / ${MOCK_INTERNS.filter(i => i.internType === 'rs').length}`} sub="Intern Types" icon={<Briefcase className="text-white" />} color="bg-pink-500" />
          <StatCard title="Avg Task Progress" value="78%" sub={`${MOCK_INTERNS.length} active tracks`} icon={<Target className="text-white" />} color="bg-cyan-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DSU Status */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2"><Calendar size={20} className="text-purple-600" /> Today's DSU Status</h2>
              <Link to="/admin/dsu-board" className="text-blue-600 text-sm font-semibold flex items-center gap-1">View Board <ArrowRight size={14} /></Link>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-600">{todaysDSUs.length}</div>
                <div className="text-xs text-slate-500 font-bold uppercase">Submitted</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-yellow-600">{activeInterns.length - todaysDSUs.length}</div>
                <div className="text-xs text-slate-500 font-bold uppercase">Pending</div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-red-600">{blockedInterns.length}</div>
                <div className="text-xs text-slate-500 font-bold uppercase">Blocked</div>
              </div>
            </div>
            {blockedInterns.map(block => {
              const intern = MOCK_INTERNS.find(i => i._id === block.internId);
              return (
                <div key={block._id} className="flex gap-4 p-3 bg-red-50/50 rounded-lg border border-red-100 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold">{getInitials(intern?.name || '')}</div>
                  <div>
                    <div className="font-bold text-slate-800">{intern?.name}</div>
                    <div className="text-sm text-slate-500 truncate">{block.blockers}</div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Recent Activity */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6"><Activity size={20} className="text-purple-600" /> Recent Activity</h2>
            <div className="space-y-4">
              {[
                { user: 'Ananya Das', action: 'Submitted DSU', time: '2 mins ago', type: 'dsu' },
                { user: 'Arjun Patel', action: 'Completed Task', time: '15 mins ago', type: 'task' },
                { user: 'Rajesh Kumar', action: 'Provided Feedback', time: '1 hour ago', type: 'feedback' },
              ].map((act, i) => (
                <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Award size={20} /></div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 text-sm">{act.user}</div>
                    <div className="text-xs text-slate-500">{act.action}</div>
                  </div>
                  <div className="text-xs text-slate-400">{act.time}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Interns Table */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2"><Users size={20} className="text-purple-600" /> Recent Interns</h2>
            <button className="text-blue-600 text-sm font-semibold flex items-center gap-1">View All <ArrowRight size={14} /></button>
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
                {MOCK_INTERNS.map(intern => (
                  <tr key={intern._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">{getInitials(intern.name)}</div>
                      <div>
                        <div className="font-bold text-slate-800">{intern.name}</div>
                        <div className="text-slate-400 text-xs">{intern.domain}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-purple-600 uppercase text-xs">{intern.internType}</td>
                    <td className="px-6 py-4 text-slate-600">{intern.currentProject}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${getStatusColor(intern.status)}15`, color: getStatusColor(intern.status) }}>
                        {intern.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{intern.mentor}</td>
                  </tr>
                ))}
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
      <div className={`${color} p-3 rounded-xl shadow-lg shadow-black/5`}>{icon}</div>
    </div>
    <div className="text-xs text-slate-400 font-medium">{sub}</div>
  </div>
);

export default AdminDashboard;