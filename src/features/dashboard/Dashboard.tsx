import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Music,
  ShoppingBag,
  Coffee,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  PlusCircle,
  CreditCard,
  ChevronRight,
  Sparkles,
  Wallet,
  PiggyBank,
  Plus,
  Ghost,
  ExternalLink,
  Cloud,
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { useSettings } from '@/hooks/useSettings';
import { useAccounts } from '@/hooks/useAccounts';
import { useAppSelector } from '@/hooks/redux';
import { FintroCard } from '@/components/ui/FinsightCard';
import { QuickActionGroup } from '@/components/ui/QuickActionGroup';
import { QuickAddModal } from '@/components/QuickAddModal';
import { PillFilter } from '@/components/ui/PillFilter';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { Helmet } from 'react-helmet-async';
import { ROUTES } from '@/constants';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDashboard();
  const { accounts, totalBalance: accountsTotal } = useAccounts();
  const { data: settings } = useSettings();
  const { user } = useAppSelector((state) => state.auth);

  // Quick Action Modal state
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<any>('EXPENSE');
  const [activeAccountFilter, setActiveAccountFilter] = useState('all');

  const currency = settings?.currency === 'USD' ? '$' : '₹';

  // Safe Category Name Extractor to prevent React object child errors
  const getCategoryName = (categoryVal: any): string => {
    if (!categoryVal) return 'General';
    if (typeof categoryVal === 'string') return categoryVal;
    if (typeof categoryVal === 'object' && categoryVal !== null) {
      return categoryVal.name || 'General';
    }
    return 'General';
  };

  // Dynamic Icon Resolver with Two-Tone Gradient Badges
  const getTwoToneCategoryIcon = (categoryVal: any, titleStr: string) => {
    const categoryStr = getCategoryName(categoryVal);
    const combined = (categoryStr + ' ' + (titleStr || '')).toLowerCase();
    if (combined.includes('uber') || combined.includes('cab') || combined.includes('transport') || combined.includes('fuel')) {
      return {
        icon: Car,
        style: 'bg-gradient-to-br from-blue-400/20 via-sky-500/10 to-blue-500/25 text-sky-600 dark:text-sky-400 border border-sky-300/40 dark:border-sky-700/40',
      };
    }
    if (combined.includes('spotify') || combined.includes('music') || combined.includes('entertainment') || combined.includes('movie')) {
      return {
        icon: Music,
        style: 'bg-gradient-to-br from-purple-400/20 via-indigo-500/10 to-purple-500/25 text-purple-600 dark:text-purple-400 border border-purple-300/40 dark:border-purple-700/40',
      };
    }
    if (combined.includes('amazon') || combined.includes('shopping') || combined.includes('grocery') || combined.includes('store')) {
      return {
        icon: ShoppingBag,
        style: 'bg-gradient-to-br from-emerald-400/20 via-teal-500/10 to-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-700/40',
      };
    }
    if (combined.includes('coffee') || combined.includes('food') || combined.includes('restaurant') || combined.includes('swiggy') || combined.includes('zomato')) {
      return {
        icon: Coffee,
        style: 'bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-300/40 dark:border-amber-700/40',
      };
    }
    return {
      icon: Cloud,
      style: 'bg-gradient-to-br from-indigo-400/20 via-violet-500/10 to-indigo-500/25 text-indigo-600 dark:text-indigo-400 border border-indigo-300/40 dark:border-indigo-700/40',
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-xl mx-auto font-sans">
        <Skeleton className="h-12 w-48 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="h-56 w-full rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="h-24 w-full rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 text-center font-sans">
        <h2 className="text-lg font-bold text-rose-500">Failed to load dashboard data</h2>
        <p className="text-zinc-500 text-xs">Ensure backend server is running and database is connected.</p>
      </div>
    );
  }

  const { stats, recentActivity } = data;
  const netBalance = accountsTotal || stats.netBalance?.value || 12505.58;
  const recentExpenses = recentActivity?.expenses || [];

  // Filter accounts if pill selected
  const filteredAccounts = activeAccountFilter === 'all'
    ? accounts
    : accounts.filter((acc: any) => acc.type.includes(activeAccountFilter));

  return (
    <div className="space-y-6 text-left font-sans pb-16 max-w-xl mx-auto animate-fade-in">
      <Helmet>
        <title>My Wallet — Fintro</title>
      </Helmet>

      {/* User Greeting & Header (Matching Fintro Screen 2) */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt={user?.name || 'Jane Cooper'}
            className="h-12 w-12 border-2 border-white dark:border-zinc-800 shadow-sm"
          />
          <div>
            <span className="text-xs font-medium text-zinc-400 block">Good Morning</span>
            <h1 className="text-lg font-extrabold text-zinc-900 dark:text-white leading-tight">
              {user?.name || 'Jane Cooper'}
            </h1>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">My Wallet</h2>
        <button
          type="button"
          onClick={() => navigate(ROUTES.ACCOUNTS)}
          className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          Manage Cards
        </button>
      </div>

      {/* Golden Metallic Digital Credit Card (FintroCard) */}
      <FintroCard
        cardName="Fintro"
        brand="VISA"
        balance={netBalance}
        cardNumber="•••• •••• •••• 6925"
        expDate="10/28"
        onClick={() => navigate(ROUTES.ACCOUNTS)}
      />

      {/* 3 Circular Action Buttons: Send, Request, Add Fund */}
      <QuickActionGroup
        onSend={() => {
          setQuickAddType('EXPENSE');
          setQuickAddModalOpen(true);
        }}
        onRequest={() => {
          setQuickAddType('BORROW');
          setQuickAddModalOpen(true);
        }}
        onAddFund={() => {
          setQuickAddType('INCOME');
          setQuickAddModalOpen(true);
        }}
      />

      {/* Account Type Filter Pills Bar */}
      <div className="pt-1">
        <PillFilter
          options={[
            { id: 'all', label: 'All Accounts', icon: Wallet },
            { id: 'bank', label: 'Banking', icon: Wallet },
            { id: 'cash', label: 'Cash', icon: PiggyBank },
            { id: 'credit', label: 'Cards', icon: CreditCard },
          ]}
          activeId={activeAccountFilter}
          onChange={setActiveAccountFilter}
          variant="dark"
        />
      </div>

      {/* Filtered Account Chips (if filter active or available) */}
      {filteredAccounts.length > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {filteredAccounts.slice(0, 2).map((acc: any) => (
            <div
              key={acc._id}
              onClick={() => navigate(ROUTES.ACCOUNTS)}
              className="p-3.5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between cursor-pointer hover:border-zinc-300 transition-all"
            >
              <span className="text-xs font-semibold text-zinc-400 truncate">{acc.name}</span>
              <span className="text-sm font-extrabold text-zinc-900 dark:text-white mt-1">
                {currency}{acc.currentBalance?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Transactions Feed Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Transaction</h3>
          <button
            type="button"
            onClick={() => navigate(ROUTES.EXPENSES)}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-4">
          {/* Dynamic Recent Transactions from backend database */}
          {recentExpenses.length > 0 ? (
            recentExpenses.slice(0, 5).map((exp: any, idx: number) => {
              const duotone = getTwoToneCategoryIcon(exp.category || '', exp.title || exp.merchant || '');
              const IconComp = duotone.icon;

              return (
                <div
                  key={exp._id || idx}
                  className="flex items-center justify-between group cursor-pointer gap-2 py-1"
                  onClick={() => navigate(ROUTES.EXPENSES)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${duotone.style}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white truncate max-w-[140px] xs:max-w-[180px] sm:max-w-none">
                        {exp.title || exp.merchant || 'Transaction'}
                      </h4>
                      <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 truncate block">
                        {getCategoryName(exp.category)} · {exp.date ? new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-500 shrink-0 pl-1">
                    {currency}{exp.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })
          ) : (
            // Mock Reference Defaults when DB is empty
            <>
              <div className="flex items-center justify-between group cursor-pointer gap-2 py-1" onClick={() => navigate(ROUTES.EXPENSES)}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400/20 via-sky-500/10 to-blue-500/25 text-sky-600 dark:text-sky-400 border border-sky-300/40 dark:border-sky-700/40 flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">Uber Ride</h4>
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 truncate block">Transport · May 29</p>
                  </div>
                </div>
                <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white shrink-0 pl-1">$8.75</span>
              </div>

              <div className="flex items-center justify-between group cursor-pointer gap-2 py-1" onClick={() => navigate(ROUTES.EXPENSES)}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-400/20 via-indigo-500/10 to-purple-500/25 text-purple-600 dark:text-purple-400 border border-purple-300/40 dark:border-purple-700/40 flex items-center justify-center shrink-0">
                    <Music className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">Spotify Premium</h4>
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 truncate block">Entertainment · May 15</p>
                  </div>
                </div>
                <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white shrink-0 pl-1">$19.99</span>
              </div>

              <div className="flex items-center justify-between group cursor-pointer gap-2 py-1" onClick={() => navigate(ROUTES.EXPENSES)}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/20 via-teal-500/10 to-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-700/40 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">Amazon Purchase</h4>
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 truncate block">Shopping · May 3</p>
                  </div>
                </div>
                <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white shrink-0 pl-1">$120.00</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Universal Interactive Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddModalOpen}
        initialType={quickAddType}
        onClose={() => setQuickAddModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
