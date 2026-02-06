// import React, { useState } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import {
//   LayoutDashboard,
//   Users,
//   ClipboardList,
//   Settings,
//   LogOut,
//   Menu,
//   X,
//   ChevronLeft,
//   User,
//   Calendar,
//   FileText,
//   UserCheck,
// } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { useAuth } from '@/contexts/AuthContext';
// import Avatar from '@/components/shared/Avatar';
// import { Button } from '@/components/ui/button';

// interface DashboardLayoutProps {
//   children: React.ReactNode;
// }

// const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Navigation links for Admin role
//   const adminLinks = [
//     { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
//     { to: '/admin/interns', icon: Users, label: 'User Management' },
//     { to: '/admin/references', icon: FileText, label: 'References' },
//     { to: '/admin/dsu-board', icon: ClipboardList, label: 'DSU Board' },
//     { to: '/admin/pto', icon: Calendar, label: 'PTO/WFH Requests' },
//     { to: '/admin/users', icon: UserCheck, label: 'User Approvals' },
   
//   ];

//   // Navigation links for Scrum Master role
//   const scrumMasterLinks = [
//     { to: '/scrum-master', icon: LayoutDashboard, label: 'Overview' },
//     { to: '/scrum-master/dsu-board', icon: ClipboardList, label: 'DSU Board' },
//     { to: '/scrum-master/daily-updates', icon: Calendar, label: 'Daily Updates' },
//     { to: '/scrum-master/profile', icon: User, label: 'Profile' },
//   ];

//   // Navigation links for Intern role
//   const internLinks = [
//     { to: '/intern', icon: LayoutDashboard, label: 'Overview' },
//     { to: '/intern/daily-updates', icon: Calendar, label: 'Daily Updates' },
//     { to: '/intern/pto', icon: Calendar, label: 'PTO/WFH Requests' },
//     { to: '/intern/profile', icon: User, label: 'Profile' },
//   ];

//   // Determine links based on user role
//   const getLinksForRole = () => {
//     switch (user?.role) {
//       case 'admin':
//         return adminLinks;
//       case 'scrum_master':
//         return scrumMasterLinks;
//       case 'intern':
//       default:
//         return internLinks;
//     }
//   };

//   const links = getLinksForRole();

//   const handleLogout = () => {
//     setShowLogoutModal(true);
//   };

//   const confirmLogout = () => {
//     logout();
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/login');
//     setShowLogoutModal(false);
//   };

//   // Get home route based on user role
//   const getHomeRoute = () => {
//     switch (user?.role) {
//       case 'admin':
//         return '/admin';
//       case 'scrum_master':
//         return '/scrum-master';
//       case 'intern':
//       default:
//         return '/intern';
//     }
//   };

//   const NavLink = ({
//     to,
//     icon: Icon,
//     label,
//   }: {
//     to: string;
//     icon: React.ElementType;
//     label: string;
//   }) => {
//     const isActive = location.pathname === to;

//     return (
//       <Link
//         to={to}
//         onClick={() => setMobileOpen(false)}
//         className={cn(
//           'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
//           isActive
//             ? 'bg-sidebar-primary text-sidebar-primary-foreground'
//             : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
//         )}
//       >
//         <Icon className="h-5 w-5 shrink-0" />
//         {(sidebarOpen || mobileOpen) && <span>{label}</span>}
//       </Link>
//     );
//   };

//   return (
//     <div className="flex min-h-screen w-full bg-background">
//       {/* Desktop Sidebar */}
//       <aside
//         className={cn(
//           'fixed left-0 top-0 z-40 hidden h-screen flex-col bg-sidebar transition-all duration-300 md:flex',
//           sidebarOpen ? 'w-64' : 'w-20'
//         )}
//       >
//         {/* Logo & Toggle */}
//         <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
//           <Link to={getHomeRoute()} className="flex items-center gap-2">
//             <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
//               <span className="text-lg font-bold text-sidebar-primary-foreground">
//                 IL
//               </span>
//             </div>
//             {sidebarOpen && (
//               <span className="text-sm font-semibold text-sidebar-foreground truncate">
//                 Interns360
//               </span>
//             )}
//           </Link>
//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
//             title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
//           >
//             <ChevronLeft
//               className={cn(
//                 'h-5 w-5 transition-transform duration-300',
//                 !sidebarOpen && 'rotate-180'
//               )}
//             />
//           </button>
//         </div>

//         {/* Nav Links */}
//         <nav className="flex-1 space-y-1 overflow-y-auto p-3">
//           {links.map((link) => (
//             <NavLink key={link.to} {...link} />
//           ))}
//         </nav>

//         {/* User & Logout */}
//         <div className="border-t border-sidebar-border p-3">
//           <div
//             className={cn(
//               'flex items-center gap-3 rounded-lg px-3 py-2',
//               sidebarOpen ? 'justify-between' : 'justify-center'
//             )}
//           >
//             <div className="flex items-center gap-3 min-w-0">
//               <Avatar name={user?.name || ''} size="sm" />
//               {sidebarOpen && (
//                 <div className="overflow-hidden">
//                   <p className="truncate text-sm font-medium text-sidebar-foreground">
//                     {user?.name}
//                   </p>
//                   <p className="truncate text-xs text-sidebar-foreground/60 capitalize">
//                     {user?.role?.replace('_', ' ')}
//                   </p>
//                 </div>
//               )}
//             </div>
//             {sidebarOpen && (
//               <button
//                 onClick={handleLogout}
//                 className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors flex-shrink-0"
//                 title="Logout"
//               >
//                 <LogOut className="h-4 w-4" />
//               </button>
//             )}
//           </div>
//         </div>
//       </aside>

//       {/* Mobile Header */}
//       <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
//         <Link to={getHomeRoute()} className="flex items-center gap-2 flex-1">
//           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary flex-shrink-0">
//             <span className="text-sm font-bold text-primary-foreground">IL</span>
//           </div>
//           <span className="font-semibold truncate">Interns360</span>
//         </Link>
//         <button
//           onClick={() => setMobileOpen(!mobileOpen)}
//           className="rounded-lg p-2 hover:bg-muted ml-2"
//         >
//           {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//         </button>
//       </div>

//       {/* Mobile Sidebar */}
//       {mobileOpen && (
//         <>
//           <div
//             className="fixed inset-0 z-40 bg-black/50 md:hidden"
//             onClick={() => setMobileOpen(false)}
//           />
//           <aside className="fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-72 bg-sidebar p-3 md:hidden overflow-y-auto">
//             <nav className="space-y-1 mb-20">
//               {links.map((link) => (
//                 <NavLink key={link.to} {...link} />
//               ))}
//             </nav>
//             <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-3 bg-sidebar">
//               <div className="flex items-center justify-between rounded-lg px-3 py-2">
//                 <div className="flex items-center gap-3">
//                   <Avatar name={user?.name || ''} size="sm" />
//                   <div>
//                     <p className="text-sm font-medium text-sidebar-foreground">
//                       {user?.name}
//                     </p>
//                     <p className="text-xs text-sidebar-foreground/60 capitalize">
//                       {user?.role?.replace('_', ' ')}
//                     </p>
//                   </div>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={handleLogout}
//                   className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
//                 >
//                   <LogOut className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </aside>
//         </>
//       )}

//       {/* Logout Confirmation Modal */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="bg-background rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
//             <h2 className="text-lg font-semibold mb-2">Logout</h2>
//             <p className="text-muted-foreground mb-6">
//               Are you sure you want to logout? 😢
//             </p>
//             <div className="flex gap-3 justify-end">
//               <Button
//                 variant="outline"
//                 onClick={() => setShowLogoutModal(false)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="destructive"
//                 onClick={confirmLogout}
//               >
//                 Logout
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <main
//         className={cn(
//           'flex-1 transition-all duration-300',
//           'pt-14 md:pt-0',
//           sidebarOpen ? 'md:ml-64' : 'md:ml-20'
//         )}
//       >
//         <div className="min-h-screen p-4 md:p-6 lg:p-8">{children}</div>
//       </main>
//     </div>
//   );
// };

// export default DashboardLayout;



import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  User,
  Calendar,
  FileText,
  UserCheck,
  BarChart3,
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation links for Admin role
  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/interns', icon: Users, label: 'User Management' },
    { to: '/admin/references', icon: FileText, label: 'References' },
    { to: '/admin/dsu-board', icon: ClipboardList, label: 'DSU Board' },
    { to: '/admin/pto', icon: Calendar, label: 'PTO/WFH Requests' },
    { to: '/admin/users', icon: UserCheck, label: 'User Approvals' },
    { to: '/admin/performance', icon: BarChart3, label: 'Performance' }, // ✅ NEW: Performance Link
  ];

  // Navigation links for Scrum Master role
  const scrumMasterLinks = [
    { to: '/scrum-master', icon: LayoutDashboard, label: 'Overview' },
    { to: '/scrum-master/dsu-board', icon: ClipboardList, label: 'DSU Board' },
    { to: '/scrum-master/daily-updates', icon: Calendar, label: 'Daily Updates' },
    { to: '/scrum-master/profile', icon: User, label: 'Profile' },
  ];

  // Navigation links for Intern role
  const internLinks = [
    { to: '/intern', icon: LayoutDashboard, label: 'Overview' },
    { to: '/intern/daily-updates', icon: Calendar, label: 'Daily Updates' },
    { to: '/intern/pto-requests', icon: Calendar, label: 'PTO/WFH Requests' },
    { to: '/intern/profile', icon: User, label: 'Profile' },
  ];

  // Determine links based on user role
  const getLinksForRole = () => {
    switch (user?.role) {
      case 'admin':
        return adminLinks;
      case 'scrum_master':
        return scrumMasterLinks;
      case 'intern':
      default:
        return internLinks;
    }
  };

  const links = getLinksForRole();

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setShowLogoutModal(false);
  };

  // Get home route based on user role
  const getHomeRoute = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin';
      case 'scrum_master':
        return '/scrum-master';
      case 'intern':
      default:
        return '/intern';
    }
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
          <Link to={getHomeRoute()} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <span className="text-lg font-bold text-sidebar-primary-foreground">
                IL
              </span>
            </div>
            {sidebarOpen && (
              <span className="text-sm font-semibold text-sidebar-foreground truncate">
                Interns360
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
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
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={user?.name || ''} size="sm" />
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/60 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
        <Link to={getHomeRoute()} className="flex items-center gap-2 flex-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary flex-shrink-0">
            <span className="text-sm font-bold text-primary-foreground">IL</span>
          </div>
          <span className="font-semibold truncate">Interns360</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 hover:bg-muted ml-2"
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
          <aside className="fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-72 bg-sidebar p-3 md:hidden overflow-y-auto">
            <nav className="space-y-1 mb-20">
              {links.map((link) => (
                <NavLink key={link.to} {...link} />
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-3 bg-sidebar">
              <div className="flex items-center justify-between rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <Avatar name={user?.name || ''} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-sidebar-foreground">
                      {user?.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 capitalize">
                      {user?.role?.replace('_', ' ')}
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Logout</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to logout? 😢
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
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
