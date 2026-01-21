import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw,
  ArrowRight,
  Search
} from 'lucide-react';

// Mock Services (Replace these imports with your actual service files)
// import { taskService } from '@/services/taskService';
// import { internService } from '@/services/internService';

const DSUBoard: React.FC = () => {
  // --- State Management ---
  const [tasks, setTasks] = useState<any[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [internFilter, setInternFilter] = useState('all');

  // --- Data Fetching ---
  const loadData = async () => {
    try {
      setLoading(true);
      // In production, use: 
      // const [t, i] = await Promise.all([taskService.getAll(), internService.getAll('active')]);
      
      // Using timeout to simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mocking the data structure based on your previous messages
      setInterns([
        { _id: '1', name: 'Priya Sharma', domain: 'Frontend', currentProject: 'Interns360' },
        { _id: '2', name: 'Arjun Patel', domain: 'Backend', currentProject: 'HR Portal' },
        { _id: '3', name: 'Karthik Nair', domain: 'Full Stack', currentProject: 'Cloud Migration' }
      ]);
      setTasks([
        { _id: 't1', internId: '1', title: 'API Integration', status: 'DONE', project: 'Interns360', date: selectedDate, comments: 'Finished the auth flow' },
        { _id: 't2', internId: '2', title: 'DB Setup', status: 'BLOCKED', project: 'HR Portal', date: selectedDate, comments: 'Waiting for credentials' },
      ]);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // --- Logic & Filtering ---
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesIntern = internFilter === 'all' || task.internId === internFilter;
    return matchesStatus && matchesIntern;
  });

  const tasksByIntern = filteredTasks.reduce((acc, task) => {
    if (!acc[task.internId]) acc[task.internId] = [];
    acc[task.internId].push(task);
    return acc;
  }, {} as Record<string, any[]>);

  const stats = {
    total: interns.length,
    submitted: Object.keys(tasksByIntern).length,
    completed: filteredTasks.filter(t => t.status === 'DONE').length,
    blocked: filteredTasks.filter(t => t.status === 'BLOCKED').length,
  };

  // --- Inline Styles ---
  const styles: Record<string, React.CSSProperties> = {
    container: { padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '20px', flexWrap: 'wrap' },
    title: { fontSize: '28px', fontWeight: 800, color: '#2D0B59', margin: 0 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' },
    statCard: { background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #7C3AED' },
    filterBar: { background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' },
    input: { padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', minWidth: '180px' },
    internCard: { background: 'white', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
    cardHeader: { padding: '20px', background: '#fcfcfd', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 20px', fontSize: '12px', color: '#94a3b8', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' },
    td: { padding: '16px 20px', fontSize: '14px', borderBottom: '1px solid #f1f5f9' },
  };

  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}><RefreshCw className="animate-spin" size={40} color="#7C3AED"/></div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Daily Standup Board</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Managing progress for {interns.length} active members</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadData} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}><RefreshCw size={18}/></button>
          <button style={{ padding: '10px 20px', borderRadius: '8px', background: '#7C3AED', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18}/> Export CSV
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px' }}><Users color="#7C3AED"/></div>
          <div><div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.total}</div><div style={{ fontSize: '12px', color: '#64748b' }}>Interns</div></div>
        </div>
        <div style={{ ...styles.statCard, borderLeftColor: '#22c55e' }}>
          <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px' }}><CheckCircle color="#22c55e"/></div>
          <div><div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.submitted}</div><div style={{ fontSize: '12px', color: '#64748b' }}>Submitted</div></div>
        </div>
        <div style={{ ...styles.statCard, borderLeftColor: '#ef4444' }}>
          <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '12px' }}><AlertTriangle color="#ef4444"/></div>
          <div><div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.blocked}</div><div style={{ fontSize: '12px', color: '#64748b' }}>Blocked</div></div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Select Date</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={styles.input} />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Intern</label>
          <select value={internFilter} onChange={(e) => setInternFilter(e.target.value)} style={styles.input}>
            <option value="all">All Interns</option>
            {interns.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.input}>
            <option value="all">All Status</option>
            <option value="DONE">Done</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      {/* Intern Section */}
      {interns.filter(i => internFilter === 'all' || i._id === internFilter).map(intern => {
        const internTasks = tasksByIntern[intern._id] || [];
        if (internTasks.length === 0 && internFilter === 'all') return null;

        return (
          <div key={intern._id} style={styles.internCard}>
            <div style={styles.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#9333EA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                  {intern.name[0]}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{intern.name}</h3>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{intern.domain} • {intern.currentProject}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#5B1AA6' }}>{internTasks.length} UPDATES</span>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Task Description</th>
                    <th style={styles.th}>Project</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {internTasks.length > 0 ? internTasks.map(task => (
                    <tr key={task._id}>
                      <td style={styles.td}><strong>{task.title}</strong></td>
                      <td style={styles.td}>{task.project}</td>
                      {/* <td style={styles.td}><span style={styles.badge(task.status)}>{task.status}</span></td> */}
                      <td style={styles.td}><span style={{ color: '#64748b', fontStyle: 'italic' }}>{task.comments}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No updates submitted for this date.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DSUBoard;