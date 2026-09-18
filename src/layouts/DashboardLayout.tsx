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
  Receipt,
  ArrowLeftRight,
  Home,
  PiggyBank,
  FileText,
  Wallet,
  Plus,
  Tv,
  Inbox as InboxIcon,
  Grid,
  Search,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/features/auth/authSlice';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import { Sheet } from '@/components/ui/Sheet';
import { QuickAddModal } from '@/components/QuickAddModal';
import { APP_NAME, ROUTES } from '@/constants';

export const DashboardLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAppSelector((state) => state.auth);
  const { theme, setTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const menuItems = isAdmin
    ? [
      { label: 'Home', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
      { label: 'Accounts', path: ROUTES.ACCOUNTS, icon: Wallet },
      { label: 'Inbox', path: ROUTES.INBOX, icon: InboxIcon },
      { label: 'Users', path: ROUTES.USERS, icon: Users },
      { label: 'Reports', path: ROUTES.REPORTS, icon: FileText },
      { label: 'Settings', path: ROUTES.SETTINGS, icon: SettingsIcon },
    ]
    : [
      { label: 'Home', path: ROUTES.DASHBOARD, icon: Home },
      { label: 'Bills', path: ROUTES.SUBSCRIPTIONS, icon: Tv },
      { label: 'Transactions', path: ROUTES.EXPENSES, icon: Receipt },
      { label: 'Accounts', path: ROUTES.ACCOUNTS, icon: Wallet },
      { label: 'Inbox', path: ROUTES.INBOX, icon: InboxIcon },
      { label: 'Ledger', path: ROUTES.LEDGER, icon: ArrowLeftRight },
      { label: 'Loans & Savings', path: ROUTES.LOANS, icon: PiggyBank },
      { label: 'Reports', path: ROUTES.REPORTS, icon: FileText },
      { label: 'Settings', path: ROUTES.SETTINGS, icon: SettingsIcon },
    ];

  // Mobile bottom core navigation items with Transactions in the mid position
  const mobileCoreNav = [
    { label: 'Home', path: ROUTES.DASHBOARD, icon: Home },
    { label: 'Reports', path: ROUTES.REPORTS, icon: FileText },
    { label: 'Transactions', path: ROUTES.EXPENSES, icon: Plus, isMid: true },
    { label: 'Wallet', path: ROUTES.ACCOUNTS, icon: Wallet },
    { label: 'Settings', path: ROUTES.SETTINGS, icon: SettingsIcon },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const activeThemeIcon = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    system: <Monitor className="h-4 w-4" />,
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
    { id: 'n-1', label: 'Spotify membership due in 3 days', icon: <Tv className="h-4 w-4 text-primary" />, onClick: () => navigate(ROUTES.SUBSCRIPTIONS) },
    { id: 'n-2', label: 'Monthly budget 50% used', icon: <Receipt className="h-4 w-4 text-amber-500" /> },
    { id: 'n-div', label: '', divider: true },
    { id: 'n-clear', label: 'Clear all notifications', onClick: () => setNotificationCount(0) },
  ];

  const renderSidebar = (isDrawer = false) => (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 text-foreground font-sans">
      {/* Brand logo header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-zinc-200 dark:border-zinc-800">
        <Link to="/" className="flex items-center gap-3 font-bold tracking-tight">
          <div className="h-10 w-10 rounded-2xl bg-[#18181B] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
            F
          </div>
          <span className="text-xl font-black tracking-tight font-sans text-zinc-900 dark:text-white">
            Fintro
          </span>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
        <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
          Menu
        </span>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isDrawer && setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group ${isActive
                ? 'bg-[#18181B] text-white shadow-sm dark:bg-white dark:text-zinc-900'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer User Profile */}
      {user && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div
            onClick={() => navigate(ROUTES.SETTINGS)}
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Avatar src={user.avatar} alt={user.name} className="h-10 w-10 border border-zinc-200 dark:border-zinc-700" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-zinc-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F9F9FA] dark:bg-[#09090B] overflow-hidden font-sans text-zinc-900 dark:text-zinc-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-full shrink-0 w-64 z-30">
        {renderSidebar(false)}
      </aside>

      {/* Mobile Drawer */}
      <Sheet isOpen={mobileOpen} onClose={() => setMobileOpen(false)} side="left" title="" className="p-0 border-r w-72 max-w-[80vw]">
        <div className="h-full">
          {renderSidebar(true)}
        </div>
      </Sheet>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header Matching Reference Screen 2 */}
        <header className="h-16 md:h-20 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-20 sticky top-0 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 rounded-full"
            >
              <Menu className="h-5 w-5" />
            </Button>


          </div>

          <div className="flex items-center gap-3">
            {/* Quick Action Add Button */}
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="inline-flex items-center gap-1.5 p-2.5 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />

            </button>

            {/* Dark/Light Theme Toggle Switch Button */}
            {/* <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-zinc-700" />}
            </button> */}

            {/* Notification Bell */}
            <Dropdown
              trigger={
                <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200">
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-900" />
                  )}
                </Button>
              }
              items={notificationDropdownItems}
            />

            {/* Profile Dropdown */}
            <Dropdown
              trigger={
                <Button variant="ghost" className="p-0 rounded-full hover:bg-transparent">
                  <Avatar src={user?.avatar} alt={user?.name || 'User'} className="h-9 w-9 border border-zinc-200 dark:border-zinc-700" />
                </Button>
              }
              items={profileDropdownItems}
            />
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl p-2 rounded-full flex items-center justify-around">
          {mobileCoreNav.map((item: any) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isMid) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className="relative flex items-center justify-center p-1 transition-all duration-200"
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${isActive
                      ? `${item.isMid ? "bg-gradient-to-bl from-yellow-700 to-yellow-500" : "bg-purple-300 text-white "}`
                      : `${item.isMid && "bg-gradient-to-br from-yellow-600 to-yellow-300"}'bg-[#18181B] text-white dark:bg-white dark:text-zinc-900 shadow-md hover:scale-105`
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className="relative flex items-center justify-center p-1 transition-all duration-200"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive
                    ? 'bg-[#18181B] text-white dark:bg-white dark:text-zinc-900 shadow-md scale-105'
                    : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Universal Quick Add Transaction Modal */}
      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
