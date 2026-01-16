import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  User,
  Calendar,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/shared/Avatar';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/interns', icon: Users, label: 'Interns' },
    { to: '/admin/dsu-board', icon: ClipboardList, label: 'DSU Board' },
    { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const internLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
    { to: '/dashboard/tasks', icon: FileText, label: 'Tasks' },
    { to: '/dashboard/dsu', icon: Calendar, label: 'Daily Updates' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const links = isAdmin ? adminLinks : internLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({
    to,
    icon: Icon,
    label,
  }: {
    to: string;
    icon: React.ElementType;
    label: string;
  }) => {
    const isActive = location.pathname === to;

    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {(sidebarOpen || mobileOpen) && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen flex-col bg-sidebar transition-all duration-300 md:flex',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo & Toggle */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <span className="text-lg font-bold text-sidebar-primary-foreground">
                IL
              </span>
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-sidebar-foreground">
                Intern Lifecycle by Cirruslabs
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <ChevronLeft
              className={cn(
                'h-5 w-5 transition-transform duration-300',
                !sidebarOpen && 'rotate-180'
              )}
            />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {links.map((link) => (
            <NavLink key={link.to} {...link} />
          ))}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-sidebar-border p-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2',
              sidebarOpen ? 'justify-between' : 'justify-center'
            )}
          >
            <div className="flex items-center gap-3">
              <Avatar name={user?.name || ''} size="sm" />
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/60 capitalize">
                    {user?.role}
                  </p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">IL</span>
          </div>
          <span className="font-semibold">Intern Lifecycle</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 hover:bg-muted"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-72 bg-sidebar p-3 md:hidden animate-slide-down">
            <nav className="space-y-1">
              {links.map((link) => (
                <NavLink key={link.to} {...link} />
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-3">
              <div className="flex items-center justify-between rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <Avatar name={user?.name || ''} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-sidebar-foreground">
                      {user?.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          'pt-14 md:pt-0',
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        )}
      >
        <div className="min-h-screen p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
