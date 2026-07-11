import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Monitor,
  LayoutDashboard,
  Users,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Receipt,
  ArrowLeftRight,
  Home,
  PiggyBank,
  FileText,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { toggleSidebar } from '@/store/settingsSlice';
import { logout } from '@/features/auth/authSlice';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Sheet } from '@/components/ui/Sheet';
import { APP_NAME, ROUTES } from '@/constants';

export const DashboardLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user } = useAppSelector((state) => state.auth);
  const { sidebarCollapsed } = useAppSelector((state) => state.settings);
  const { theme, setTheme } = useTheme();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const isAdmin = user?.role === 'admin';
  const menuItems = isAdmin
    ? [
        { label: 'Overview', path: ROUTES.DASHBOARD, icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: 'Users', path: ROUTES.USERS, icon: <Users className="h-5 w-5" /> },
        { label: 'Reports', path: ROUTES.REPORTS, icon: <FileText className="h-5 w-5" /> },
        { label: 'Settings', path: ROUTES.SETTINGS, icon: <SettingsIcon className="h-5 w-5" /> },
      ]
    : [
        { label: 'Overview', path: ROUTES.DASHBOARD, icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: 'Expenses', path: ROUTES.EXPENSES, icon: <Receipt className="h-5 w-5" /> },
        { label: 'Ledger', path: ROUTES.LEDGER, icon: <ArrowLeftRight className="h-5 w-5" /> },
        { label: 'Room', path: ROUTES.ROOM, icon: <Home className="h-5 w-5" /> },
        { label: 'Loans & Savings', path: ROUTES.LOANS, icon: <PiggyBank className="h-5 w-5" /> },
        { label: 'Reports', path: ROUTES.REPORTS, icon: <FileText className="h-5 w-5" /> },
        { label: 'Settings', path: ROUTES.SETTINGS, icon: <SettingsIcon className="h-5 w-5" /> },
      ];

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  // Build breadcrumbs path dynamically based on URL pathname
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbItems = pathnames.map((name, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
    return {
      label: name.charAt(0).toUpperCase() + name.slice(1),
      path: index === pathnames.length - 1 ? undefined : routeTo,
    };
  });

  const activeThemeIcon = {
    light: <Sun className="h-4.5 w-4.5" />,
    dark: <Moon className="h-4.5 w-4.5" />,
    system: <Monitor className="h-4.5 w-4.5" />,
  }[theme];

  const themeDropdownItems = [
    { id: 't-light', label: 'Light', icon: <Sun className="h-4 w-4" />, onClick: () => setTheme('light') },
    { id: 't-dark', label: 'Dark', icon: <Moon className="h-4 w-4" />, onClick: () => setTheme('dark') },
    { id: 't-sys', label: 'System', icon: <Monitor className="h-4 w-4" />, onClick: () => setTheme('system') },
  ];

  const profileDropdownItems = [
    { id: 'p-settings', label: 'Account Settings', icon: <SettingsIcon className="h-4 w-4" />, onClick: () => navigate(ROUTES.SETTINGS) },
    { id: 'p-divider', label: '', divider: true },
    { id: 'p-logout', label: 'Logout', icon: <LogOut className="h-4 w-4 text-destructive" />, onClick: handleLogout },
  ];

  const notificationDropdownItems = [
    { id: 'n-1', label: 'New user registration: Alice Smith', icon: <Users className="h-4 w-4 text-primary" />, onClick: () => navigate(ROUTES.USERS) },
    { id: 'n-2', label: 'System usage spike: CPU at 85%', icon: <ShieldAlert className="h-4 w-4 text-amber-500" /> },
    { id: 'n-3', label: 'Database backup finished successfully', icon: <LayoutDashboard className="h-4 w-4 text-emerald-500" /> },
    { id: 'n-div', label: '', divider: true },
    { id: 'n-clear', label: 'Clear all notifications', onClick: () => setNotificationCount(0) },
  ];

  const sidebarContent = (isMobile = false) => {
    const isRail = !isMobile;

    return (
      <div className="flex flex-col h-full bg-card border-r border-border text-card-foreground font-sans">
        {/* Brand logo header */}
        <div className={`flex items-center justify-center h-20 border-b border-border ${isRail ? 'px-0' : 'px-6'}`}>
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <img src="/logo.png" alt="Logo" className="h-11 w-11 object-contain rounded-lg shadow-sm" />
            {!isRail && <span className="text-base font-semibold select-none font-sans">{APP_NAME}</span>}
          </Link>
        </div>

        {/* Nav List */}
        <nav className={`flex-1 py-4 space-y-3 overflow-hidden ${isRail ? 'px-2 flex flex-col items-center justify-start' : 'px-4'}`}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            if (isRail) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={`flex items-center justify-center h-12 w-12 rounded-[20px] transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-primary text-[#141414] shadow-sm'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  {/* Tooltip on hover */}
                  <span className="absolute left-16 scale-0 transition-all rounded bg-[#141414] dark:bg-[#FDFDFC] dark:text-[#141414] p-2 text-xs text-white group-hover:scale-100 z-50 whitespace-nowrap shadow-md">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-[20px] text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-[#141414] shadow-sm'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="font-sans font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Account overview */}
        {user && (
          <div className={`p-4 border-t border-border flex items-center justify-center ${isRail ? 'h-20' : 'p-6'}`}>
            <button
              onClick={() => navigate(ROUTES.SETTINGS)}
              className="flex items-center justify-center hover:scale-105 active:scale-95 transition-transform animate-fade-in"
            >
              <Avatar src={user.avatar} alt={user.name} className="h-10 w-10 border border-border rounded-full" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden md:block h-full shrink-0 w-20 z-30">
        {sidebarContent(false)}
      </aside>

      {/* Mobile sidebar (drawer) */}
      <Sheet isOpen={mobileOpen} onClose={() => setMobileOpen(false)} side="left" title="Menu" className="p-0 border-r w-72 max-w-[80vw]">
        <div className="h-full flex flex-col pt-4">
          {sidebarContent(true)}
        </div>
      </Sheet>

      {/* Primary content area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top bar header */}
        <header className="h-20 border-b border-border bg-card text-card-foreground flex items-center justify-between px-6 sm:px-8 z-20 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-card-foreground hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Breadcrumbs */}
            <Breadcrumb items={breadcrumbItems} className="hidden sm:flex" />
          </div>

          <div className="flex items-center gap-3">
            {/* Theme switcher */}
            <Dropdown
              trigger={
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-muted text-card-foreground">
                  {activeThemeIcon}
                </Button>
              }
              items={themeDropdownItems}
            />

            {/* Notifications */}
            <Dropdown
              trigger={
                <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10 hover:bg-muted text-card-foreground">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5A5A] text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                      {notificationCount}
                    </span>
                  )}
                </Button>
              }
              items={notificationDropdownItems}
            />

            {/* User Profile dropdown */}
            <Dropdown
              trigger={
                <Button variant="ghost" className="p-1 rounded-full hover:bg-[#F4F4F4]">
                  <Avatar src={user?.avatar} alt={user?.name || 'User'} className="h-9 w-9 border border-[#ECECEC]" />
                </Button>
              }
              items={profileDropdownItems}
            />
          </div>
        </header>

        {/* Content Outlet scroll frame */}
        <main className="flex-1 overflow-y-auto bg-[#F7F8F6] p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
