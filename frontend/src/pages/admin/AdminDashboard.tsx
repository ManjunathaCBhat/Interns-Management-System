import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Briefcase,
  CheckCircle,
  Calendar,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
  RefreshCw,
  ArrowRight,
  BarChart3,
  FileText,
  Target,
  Award,
  XCircle,
  LayoutDashboard,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  MessageSquare,
} from 'lucide-react';

interface Intern {
  _id: string;
  name: string;
  email: string;
  domain: string;
  status: string;
  internType: string;
  isPaid: boolean;
  currentProject: string;
  mentor: string;
  taskCount: number;
  completedTasks: number;
  dsuStreak: number;
  joinedDate: string;
}

interface DSUEntry {
  _id: string;
  internId: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
  status: string;
  submittedAt: string;
}

interface Task {
  _id: string;
  internId: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
}

interface ActivityItem {
  id: string;
  type: string;
  user: string;
  action: string;
  time: string;
}

const MOCK_INTERNS: Intern[] = [
  { _id: '1', name: 'Priya Sharma', email: 'priya@example.com', domain: 'Frontend', status: 'active', internType: 'project', isPaid: true, currentProject: 'Interns360', mentor: 'Rajesh Kumar', taskCount: 15, completedTasks: 12, dsuStreak: 5, joinedDate: '2026-01-01' },
  { _id: '2', name: 'Arjun Patel', email: 'arjun@example.com', domain: 'Backend', status: 'active', internType: 'rs', isPaid: false, currentProject: 'HR Portal', mentor: 'Sneha Reddy', taskCount: 12, completedTasks: 10, dsuStreak: 7, joinedDate: '2026-01-02' },
  { _id: '3', name: 'Karthik Nair', email: 'karthik@example.com', domain: 'Full Stack', status: 'training', internType: 'project', isPaid: true, currentProject: 'Cloud Migration', mentor: 'Amit Singh', taskCount: 8, completedTasks: 6, dsuStreak: 3, joinedDate: '2026-01-10' },
  { _id: '4', name: 'Rahul Verma', email: 'rahul@example.com', domain: 'DevOps', status: 'active', internType: 'project', isPaid: true, currentProject: 'Interns360', mentor: 'Rajesh Kumar', taskCount: 10, completedTasks: 9, dsuStreak: 6, joinedDate: '2025-12-15' },
  { _id: '5', name: 'Ananya Das', email: 'ananya@example.com', domain: 'Frontend', status: 'active', internType: 'rs', isPaid: false, currentProject: 'HR Portal', mentor: 'Sneha Reddy', taskCount: 14, completedTasks: 11, dsuStreak: 4, joinedDate: '2026-01-05' },
  { _id: '6', name: 'Vivek Gupta', email: 'vivek@example.com', domain: 'Backend', status: 'onboarding', internType: 'project', isPaid: true, currentProject: 'Cloud Migration', mentor: 'Amit Singh', taskCount: 3, completedTasks: 1, dsuStreak: 1, joinedDate: '2026-01-15' },
  { _id: '7', name: 'Meera Iyer', email: 'meera@example.com', domain: 'Full Stack', status: 'active', internType: 'project', isPaid: true, currentProject: 'Interns360', mentor: 'Rajesh Kumar', taskCount: 16, completedTasks: 14, dsuStreak: 8, joinedDate: '2025-12-20' },
  { _id: '8', name: 'Sanjay Menon', email: 'sanjay@example.com', domain: 'Backend', status: 'completed', internType: 'rs', isPaid: false, currentProject: 'HR Portal', mentor: 'Sneha Reddy', taskCount: 20, completedTasks: 20, dsuStreak: 0, joinedDate: '2025-11-01' },
];

const MOCK_DSU_ENTRIES: DSUEntry[] = [
  { _id: 'd1', internId: '1', date: '2026-01-17', yesterday: 'Completed UI components', today: 'Working on API integration', blockers: '', status: 'submitted', submittedAt: '2026-01-17T09:15:00' },
  { _id: 'd2', internId: '2', date: '2026-01-17', yesterday: 'Database optimization', today: 'REST API endpoints', blockers: 'Need database credentials', status: 'submitted', submittedAt: '2026-01-17T09:30:00' },
  { _id: 'd3', internId: '4', date: '2026-01-17', yesterday: 'CI/CD pipeline setup', today: 'Docker configuration', blockers: '', status: 'submitted', submittedAt: '2026-01-17T08:45:00' },
  { _id: 'd4', internId: '5', date: '2026-01-17', yesterday: 'Responsive design', today: 'Mobile optimization', blockers: 'Design approval pending', status: 'submitted', submittedAt: '2026-01-17T10:00:00' },
  { _id: 'd5', internId: '7', date: '2026-01-17', yesterday: 'User authentication', today: 'JWT implementation', blockers: '', status: 'submitted', submittedAt: '2026-01-17T09:00:00' },
];

const MOCK_TASKS: Task[] = [
  { _id: 't1', internId: '2', title: 'Setup database connection', status: 'blocked', priority: 'high', dueDate: '2026-01-18' },
  { _id: 't2', internId: '5', title: 'Design approval needed', status: 'blocked', priority: 'medium', dueDate: '2026-01-19' },
  { _id: 't3', internId: '1', title: 'API integration', status: 'in_progress', priority: 'high', dueDate: '2026-01-17' },
  { _id: 't4', internId: '7', title: 'JWT authentication', status: 'in_progress', priority: 'high', dueDate: '2026-01-17' },
];

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: 'a1', type: 'dsu', user: 'Ananya Das', action: 'submitted DSU', time: '2 min ago' },
  { id: 'a2', type: 'task', user: 'Arjun Patel', action: 'completed task: API Integration', time: '15 min ago' },
  { id: 'a3', type: 'intern', user: 'Vivek Gupta', action: 'joined the team', time: '1 hour ago' },
  { id: 'a4', type: 'feedback', user: 'Rajesh Kumar', action: 'gave feedback to Priya Sharma', time: '2 hours ago' },
  { id: 'a5', type: 'task', user: 'Meera Iyer', action: 'started task: User Dashboard', time: '3 hours ago' },
];

const sidebarMenu = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/admin' },
  { id: 'interns', label: 'Interns', icon: Users, path: '/admin/interns' },
  { id: 'dsu-board', label: 'DSU Board', icon: ClipboardList, path: '/admin/dsu-board' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, path: '/admin/feedback' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [interns, setInterns] = useState<Intern[]>([]);
  const [dsuEntries, setDSUEntries] = useState<DSUEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setInterns(MOCK_INTERNS);
    setDSUEntries(MOCK_DSU_ENTRIES);
    setTasks(MOCK_TASKS);
    setActivities(MOCK_ACTIVITIES);
    setLoading(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysDSUs = dsuEntries.filter(d => d.date === today);

  const stats = {
    totalInterns: interns.length,
    activeInterns: interns.filter(i => i.status === 'active').length,
    projectInterns: interns.filter(i => i.internType === 'project').length,
    rsInterns: interns.filter(i => i.internType === 'rs').length,
    paidInterns: interns.filter(i => i.isPaid).length,
    trainingInterns: interns.filter(i => i.status === 'training').length,
    onboardingInterns: interns.filter(i => i.status === 'onboarding').length,
    completedInterns: interns.filter(i => i.status === 'completed').length,
    droppedInterns: interns.filter(i => i.status === 'dropped').length,
    dsuSubmitted: todaysDSUs.length,
    dsuCompletion: interns.filter(i => i.status === 'active').length > 0
      ? Math.round((todaysDSUs.length / interns.filter(i => i.status === 'active').length) * 100)
      : 0,
    blockedTasks: tasks.filter(t => t.status === 'blocked').length,
    avgTaskCompletion: interns.length > 0
      ? Math.round((interns.reduce((sum, i) => sum + (i.taskCount > 0 ? (i.completedTasks / i.taskCount) * 100 : 0), 0)) / interns.length)
      : 0,
  };

  const internsWithBlockers = todaysDSUs
    .filter(d => d.blockers && d.blockers.trim() !== '')
    .map(d => ({
      dsu: d,
      intern: interns.find(i => i._id === d.internId),
    }))
    .filter(item => item.intern);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
    return colors[name.charCodeAt(0) % colors.length];
  };

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

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  const sidebarStyle: React.CSSProperties = {
    width: sidebarOpen ? '240px' : '0px',
    minWidth: sidebarOpen ? '240px' : '0px',
    background: 'linear-gradient(180deg, #1e1145 0%, #2d1b69 100%)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
  };

  const sidebarHeaderStyle: React.CSSProperties = {
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const logoTextStyle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 700,
    color: '#ffffff',
  };

  const logoAccentStyle: React.CSSProperties = {
    color: '#a855f7',
  };

  const sidebarNavStyle: React.CSSProperties = {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const menuItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
    background: isActive ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
    transition: 'all 0.2s ease',
    border: 'none',
    width: '100%',
    textAlign: 'left' as const,
  });

  const mainWrapperStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const topBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    gap: '16px',
  };

  const menuToggleStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #1e1145, #2d1b69)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #1e1145 0%, #2d1b69 100%)',
    padding: '32px 24px',
    color: 'white',
    boxShadow: '0 10px 40px rgba(30, 17, 69, 0.2)',
  };

  const headerContentStyle: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '8px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.8)',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    background: 'rgba(168, 85, 247, 0.3)',
    color: 'white',
    backdropFilter: 'blur(10px)',
  };

  const mainContentStyle: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
  };

  const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  };

  const statCardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    border: '1px solid #e2e8f0',
  };

  const statHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  };

  const statIconStyle = (bg: string): React.CSSProperties => ({
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg,
  });

  const statValueStyle: React.CSSProperties = {
    fontSize: '36px',
    fontWeight: 700,
    color: '#1e1145',
    marginBottom: '4px',
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: 500,
  };

  const statSubtextStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '8px',
  };

  const sectionGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
  };

  const cardHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1e1145',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const linkButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#6366f1',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const statusBreakdownStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '16px',
  };

  const statusItemStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '16px',
    borderRadius: '12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
  };

  const statusValueStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '8px',
  };

  const statusLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const dsuStatsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  };

  const dsuStatBoxStyle = (bg: string): React.CSSProperties => ({
    padding: '16px',
    borderRadius: '12px',
    textAlign: 'center',
    background: bg,
  });

  const activityListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const activityItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '10px',
    background: '#f8fafc',
    transition: 'all 0.2s ease',
  };

  const activityIconStyle = (bg: string): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg,
    flexShrink: 0,
  });

  const blockerItemStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    borderRadius: '10px',
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.1)',
    marginBottom: '12px',
  };

  const avatarStyle = (bg: string): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '14px',
    background: bg,
    flexShrink: 0,
  });

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
  };

  const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  };

  const tdStyle: React.CSSProperties = {
    padding: '16px',
    borderBottom: '1px solid #f1f5f9',
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    background: `${getStatusColor(status)}15`,
    color: getStatusColor(status),
  });

  const loadingStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e1145 0%, #2d1b69 100%)',
    gap: '20px',
  };

  const spinnerStyle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: '4px solid rgba(168, 85, 247, 0.2)',
    borderTopColor: '#a855f7',
    animation: 'spin 1s linear infinite',
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={spinnerStyle} />
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }

        .link-button:hover {
          background: #f0f9ff;
        }

        .activity-item:hover {
          background: #f1f5f9;
        }

        .table-row:hover {
          background: #f8fafc;
        }
      `}</style>

      {/* SIDEBAR */}
      <aside style={sidebarStyle}>
        <div style={sidebarHeaderStyle}>
          <div style={logoStyle}>
            <span style={logoTextStyle}>
              <span style={logoAccentStyle}>cirrus</span>labs
            </span>
          </div>
        </div>

        <nav style={sidebarNavStyle}>
          {sidebarMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                style={menuItemStyle(isActive)}
                onClick={() => navigate(item.path)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            style={{
              ...menuItemStyle(false),
              color: 'rgba(255,255,255,0.5)',
            }}
            onClick={() => {
              localStorage.removeItem('ilm_token');
              localStorage.removeItem('ilm_user');
              navigate('/login');
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={mainWrapperStyle}>
        {/* TOP BAR */}
        <div style={topBarStyle}>
          <button style={menuToggleStyle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1e1145', flex: 1 }}>Admin Dashboard</h1>
          <button
            style={buttonStyle}
            onClick={loadDashboardData}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.5)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.3)'}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

      <main style={mainContentStyle}>
        <div style={statsGridStyle}>
          <div className="stat-card" style={statCardStyle}>
            <div style={statHeaderStyle}>
              <div>
                <div style={statValueStyle}>{stats.totalInterns}</div>
                <div style={statLabelStyle}>Total Interns</div>
              </div>
              <div style={statIconStyle('linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)')}>
                <Users size={24} color="white" />
              </div>
            </div>
            <div style={statSubtextStyle}>
              {stats.activeInterns} active, {stats.trainingInterns} in training
            </div>
          </div>

          <div className="stat-card" style={statCardStyle}>
            <div style={statHeaderStyle}>
              <div>
                <div style={statValueStyle}>{stats.dsuCompletion}%</div>
                <div style={statLabelStyle}>DSU Completion</div>
              </div>
              <div style={statIconStyle(stats.dsuCompletion >= 80 ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)')}>
                <CheckCircle size={24} color="white" />
              </div>
            </div>
            <div style={statSubtextStyle}>
              {stats.dsuSubmitted} of {stats.activeInterns} submitted today
            </div>
          </div>

          <div className="stat-card" style={statCardStyle}>
            <div style={statHeaderStyle}>
              <div>
                <div style={statValueStyle}>{stats.projectInterns} / {stats.rsInterns}</div>
                <div style={statLabelStyle}>Project / RS Split</div>
              </div>
              <div style={statIconStyle('linear-gradient(135deg, #ec4899 0%, #d946ef 100%)')}>
                <Briefcase size={24} color="white" />
              </div>
            </div>
            <div style={statSubtextStyle}>
              {stats.paidInterns} paid interns
            </div>
          </div>

          <div className="stat-card" style={statCardStyle}>
            <div style={statHeaderStyle}>
              <div>
                <div style={statValueStyle}>{stats.avgTaskCompletion}%</div>
                <div style={statLabelStyle}>Avg Task Completion</div>
              </div>
              <div style={statIconStyle('linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)')}>
                <Target size={24} color="white" />
              </div>
            </div>
            <div style={statSubtextStyle}>
              {stats.blockedTasks} tasks currently blocked
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: '32px' }}>
          <h2 style={{ ...cardTitleStyle, marginBottom: '24px' }}>
            <BarChart3 size={20} color="#6366f1" />
            Intern Status Overview
          </h2>
          <div style={statusBreakdownStyle}>
            <div style={statusItemStyle}>
              <div style={{ ...statusValueStyle, color: '#eab308' }}>
                {stats.onboardingInterns}
              </div>
              <div style={statusLabelStyle}>Onboarding</div>
            </div>
            <div style={statusItemStyle}>
              <div style={{ ...statusValueStyle, color: '#3b82f6' }}>
                {stats.trainingInterns}
              </div>
              <div style={statusLabelStyle}>Training</div>
            </div>
            <div style={statusItemStyle}>
              <div style={{ ...statusValueStyle, color: '#22c55e' }}>
                {stats.activeInterns}
              </div>
              <div style={statusLabelStyle}>Active</div>
            </div>
            <div style={statusItemStyle}>
              <div style={{ ...statusValueStyle, color: '#64748b' }}>
                {stats.completedInterns}
              </div>
              <div style={statusLabelStyle}>Completed</div>
            </div>
            <div style={statusItemStyle}>
              <div style={{ ...statusValueStyle, color: '#ef4444' }}>
                {stats.droppedInterns}
              </div>
              <div style={statusLabelStyle}>Dropped</div>
            </div>
          </div>
        </div>

        <div style={sectionGridStyle}>
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h2 style={cardTitleStyle}>
                <Calendar size={20} color="#6366f1" />
                Today's DSU Status
              </h2>
              <button
                className="link-button"
                style={linkButtonStyle}
                onClick={() => navigate('/admin/dsu-board')}
              >
                View Board <ArrowRight size={14} />
              </button>
            </div>

            <div style={dsuStatsStyle}>
              <div style={dsuStatBoxStyle('rgba(34, 197, 94, 0.1)')}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#22c55e', marginBottom: '4px' }}>
                  {stats.dsuSubmitted}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                  SUBMITTED
                </div>
              </div>
              <div style={dsuStatBoxStyle('rgba(234, 179, 8, 0.1)')}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#eab308', marginBottom: '4px' }}>
                  {stats.activeInterns - stats.dsuSubmitted}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                  PENDING
                </div>
              </div>
              <div style={dsuStatBoxStyle('rgba(239, 68, 68, 0.1)')}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>
                  {internsWithBlockers.length}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                  BLOCKED
                </div>
              </div>
            </div>

            {internsWithBlockers.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} color="#ef4444" />
                  INTERNS WITH BLOCKERS
                </p>
                {internsWithBlockers.slice(0, 3).map((item) => (
                  <div key={item.dsu._id} style={blockerItemStyle}>
                    <div style={avatarStyle(getAvatarColor(item.intern!.name))}>
                      {getInitials(item.intern!.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: '#1e1145', marginBottom: '4px' }}>
                        {item.intern!.name}
                      </p>
                      <p style={{ fontSize: '13px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.dsu.blockers}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h2 style={cardTitleStyle}>
                <Activity size={20} color="#6366f1" />
                Recent Activity
              </h2>
            </div>
            <div style={activityListStyle}>
              {activities.map((activity) => (
                <div key={activity.id} className="activity-item" style={activityItemStyle}>
                  <div style={activityIconStyle(
                    activity.type === 'dsu' ? 'rgba(99, 102, 241, 0.15)' :
                    activity.type === 'task' ? 'rgba(34, 197, 94, 0.15)' :
                    activity.type === 'intern' ? 'rgba(234, 179, 8, 0.15)' :
                    'rgba(236, 72, 153, 0.15)'
                  )}>
                    {activity.type === 'dsu' && <Calendar size={20} color="#6366f1" />}
                    {activity.type === 'task' && <CheckCircle size={20} color="#22c55e" />}
                    {activity.type === 'intern' && <Users size={20} color="#eab308" />}
                    {activity.type === 'feedback' && <Award size={20} color="#ec4899" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e1145' }}>
                      {activity.user}
                    </p>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>
                      {activity.action}
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>
              <Users size={20} color="#6366f1" />
              Recent Interns
            </h2>
            <button
              className="link-button"
              style={linkButtonStyle}
              onClick={() => navigate('/admin/interns')}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, borderTopLeftRadius: '10px' }}>Intern</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Project</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Progress</th>
                  <th style={thStyle}>Streak</th>
                  <th style={{ ...thStyle, borderTopRightRadius: '10px' }}>Mentor</th>
                </tr>
              </thead>
              <tbody>
                {interns.slice(0, 6).map((intern) => (
                  <tr key={intern._id} className="table-row">
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={avatarStyle(getAvatarColor(intern.name))}>
                          {getInitials(intern.name)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '14px', color: '#1e1145' }}>
                            {intern.name}
                          </p>
                          <p style={{ fontSize: '13px', color: '#64748b' }}>
                            {intern.domain}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: intern.internType === 'project' ? '#6366f1' : '#ec4899'
                      }}>
                        {intern.internType}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '14px', color: '#1e1145' }}>
                        {intern.currentProject}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(intern.status)}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: getStatusColor(intern.status)
                        }} />
                        {intern.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          flex: 1,
                          height: '6px',
                          background: '#e2e8f0',
                          borderRadius: '3px',
                          overflow: 'hidden',
                          minWidth: '80px'
                        }}>
                          <div style={{
                            width: `${intern.taskCount > 0 ? (intern.completedTasks / intern.taskCount) * 100 : 0}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                            borderRadius: '3px'
                          }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', minWidth: '40px' }}>
                          {intern.completedTasks}/{intern.taskCount}
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: intern.dsuStreak >= 5 ? '#22c55e' : intern.dsuStreak >= 3 ? '#eab308' : '#94a3b8'
                      }}>
                        {intern.dsuStreak} 🔥
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>
                        {intern.mentor}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
