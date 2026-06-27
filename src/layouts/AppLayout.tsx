import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { 
  GraduationCap, 
  LayoutDashboard, 
  LineChart, 
  Calendar, 
  Calculator, 
  Map, 
  Settings, 
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Award,
  Shield
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const AppLayout: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    clearAuth();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    ...(user?.role === 'admin'
      ? [{ name: 'Admin Panel', path: '/admin/updates', icon: <Shield className="h-4 w-4" /> }]
      : []),
    { name: 'Feed Marks', path: '/feed-marks', icon: <GraduationCap className="h-4 w-4" /> },
    { name: 'Marks Calculator', path: '/marks-calculator', icon: <Calculator className="h-4 w-4" /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Award className="h-4 w-4" /> },
    { name: 'Academic Analytics', path: '#', icon: <LineChart className="h-4 w-4" />, badge: 'Coming Soon' },
    { name: 'Timetable', path: '#', icon: <Calendar className="h-4 w-4" />, badge: 'Coming Soon' },
    { name: 'Semester Journey', path: '#', icon: <Map className="h-4 w-4" />, badge: 'Coming Soon' },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300 ${sidebarCollapsed ? 'w-[68px]' : 'w-64'}`}>
        {/* Sidebar Header */}
        <div className="h-16 px-4 border-b border-border/10 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2 overflow-hidden">
            <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-bold tracking-tight text-lg whitespace-nowrap">ScholarOS</span>}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-2 py-6 space-y-1">
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            const isClickable = item.path !== '#';

            return isClickable ? (
              <Link
                key={idx}
                to={item.path}
                title={sidebarCollapsed ? item.name : undefined}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <span className={sidebarCollapsed ? '' : 'mr-3'}>{item.icon}</span>
                {!sidebarCollapsed && item.name}
              </Link>
            ) : (
              <div
                key={idx}
                title={sidebarCollapsed ? item.name : undefined}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'} py-2.5 rounded-lg text-sm font-medium text-muted-foreground/50 cursor-not-allowed select-none`}
              >
                <div className="flex items-center">
                  <span className={`opacity-50 ${sidebarCollapsed ? '' : 'mr-3'}`}>{item.icon}</span>
                  {!sidebarCollapsed && item.name}
                </div>
                {!sidebarCollapsed && item.badge && (
                  <span className="text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded text-muted-foreground scale-90 origin-right">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar User Profile Footer */}
        <div className="p-3 border-t border-border/10 bg-muted/10">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} mb-3`}>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold shadow-inner flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-foreground">{user?.name || 'Student'}</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{user?.role || 'STUDENT'}</p>
              </div>
            )}
          </div>
          {sidebarCollapsed ? (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full text-xs"
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
            >
              Sign Out
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/20 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center md:space-x-0 space-x-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 rounded-md md:hidden hover:bg-accent text-foreground transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-base font-semibold md:text-lg tracking-tight">
              {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-full font-medium border border-indigo-500/20">
              <Sparkles className="h-3 w-3 mr-1" /> Premium Account
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 bg-card border-r border-border h-full flex flex-col p-6 z-10 animate-in slide-in-from-left duration-300">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-8">
              <Link to="/dashboard" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                <GraduationCap className="h-7 w-7 text-indigo-600" />
                <span className="font-bold tracking-tight text-xl">ScholarOS</span>
              </Link>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                const isClickable = item.path !== '#';

                return isClickable ? (
                  <Link
                    key={idx}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                ) : (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground/45 cursor-not-allowed select-none"
                  >
                    <div className="flex items-center">
                      <span className="mr-3 opacity-50">{item.icon}</span>
                      {item.name}
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border/10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{user?.name || 'Student'}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{user?.role || 'STUDENT'}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full"
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
