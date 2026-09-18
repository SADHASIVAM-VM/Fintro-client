import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  FileText,
  ChevronLeft,
  Share2,
  TrendingUp,
  Zap,
  ShoppingBag,
  Utensils,
  Car,
  Tv,
  Activity,
  Layers,
  ArrowUpRight,
  Briefcase,
  CreditCard
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import { axiosInstance } from '@/lib/axios';
import { Helmet } from 'react-helmet-async';
import { PortfolioDonut, type PortfolioSegment } from '@/components/ui/PortfolioDonut';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants';
import { useDashboard } from '@/hooks/useDashboard';
import { useAccounts } from '@/hooks/useAccounts';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useExpenses } from '@/hooks/useExpenses';
import { useSettings } from '@/hooks/useSettings';
import dayjs from 'dayjs';

interface FlowCategoryItemProps {
  name: string;
  subtitle: string;
  amount: number;
  percentage: number;
  isPositive: boolean;
  currencySymbol: string;
  iconBg: string;
  iconNode: React.ReactNode;
}

const FlowCategoryItem: React.FC<FlowCategoryItemProps> = ({
  name,
  subtitle,
  amount,
  percentage,
  isPositive,
  currencySymbol,
  iconBg,
  iconNode,
}) => (
  <div className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-white shrink-0 shadow-sm`}>
        {iconNode}
      </div>
      <div className="text-left">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{name}</h4>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{subtitle}</p>
      </div>
    </div>

    {/* Sparkline Graph */}
    <div className="w-16 h-8 hidden sm:flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 60 25" fill="none">
        <path
          d={isPositive ? "M 2 20 Q 15 15, 30 18 T 58 5" : "M 2 5 Q 15 18, 30 10 T 58 20"}
          stroke={isPositive ? "#10B981" : "#EF4444"}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>

    {/* Amount & Percentage */}
    <div className="text-right">
      <span className="block text-sm font-extrabold text-zinc-900 dark:text-white">
        {currencySymbol}{amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
      </span>
      <span className={`text-[11px] font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
        {percentage}% of outflow
      </span>
    </div>
  </div>
);

// Map Category Names to Icon & Colors dynamically
const getCategoryIconDetails = (catName: string) => {
  const lower = catName.toLowerCase();
  if (lower.includes('food') || lower.includes('dining') || lower.includes('restaurant') || lower.includes('grocery')) {
    return { icon: <Utensils className="w-5 h-5" />, bg: 'bg-amber-500' };
  }
  if (lower.includes('shop') || lower.includes('cloth') || lower.includes('store')) {
    return { icon: <ShoppingBag className="w-5 h-5" />, bg: 'bg-purple-500' };
  }
  if (lower.includes('bill') || lower.includes('util') || lower.includes('recharge') || lower.includes('electric') || lower.includes('net')) {
    return { icon: <Zap className="w-5 h-5" />, bg: 'bg-blue-500' };
  }
  if (lower.includes('travel') || lower.includes('fuel') || lower.includes('cab') || lower.includes('vehicle') || lower.includes('car')) {
    return { icon: <Car className="w-5 h-5" />, bg: 'bg-emerald-500' };
  }
  if (lower.includes('sub') || lower.includes('stream') || lower.includes('movie') || lower.includes('tv') || lower.includes('entert')) {
    return { icon: <Tv className="w-5 h-5" />, bg: 'bg-rose-500' };
  }
  if (lower.includes('health') || lower.includes('med') || lower.includes('doctor')) {
    return { icon: <Activity className="w-5 h-5" />, bg: 'bg-cyan-500' };
  }
  if (lower.includes('work') || lower.includes('salary') || lower.includes('job') || lower.includes('business')) {
    return { icon: <Briefcase className="w-5 h-5" />, bg: 'bg-indigo-500' };
  }
  return { icon: <CreditCard className="w-5 h-5" />, bg: 'bg-zinc-800 dark:bg-zinc-700' };
};

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Period Selector: 'this_week', 'this_month', 'previous_month', 'two_months_ago'
  const [period, setPeriod] = useState<'this_week' | 'this_month' | 'previous_month' | 'two_months_ago'>('this_month');

  // Dynamic Hooks Data
  const { data: dashboardData } = useDashboard();
  const { totalBalance: rawTotalBalance } = useAccounts();
  const { totalMonthlyCost } = useSubscriptions();
  const { data: expensesData } = useExpenses({ limit: 100 });
  const { data: settingsData } = useSettings();

  const currencySymbol = useMemo(() => {
    const cur = settingsData?.data?.currency || settingsData?.currency;
    if (cur === 'USD') return '$';
    if (cur === 'EUR') return '€';
    if (cur === 'GBP') return '£';
    return '₹';
  }, [settingsData]);

  // Extract Monthly Trend History from Dashboard
  const monthlyTrends = dashboardData?.charts?.monthlyTrend || [];
  const trendLen = monthlyTrends.length;

  const previousMonthLabel = dayjs().subtract(1, 'month').format('MMM YYYY');
  const twoMonthsAgoLabel = dayjs().subtract(2, 'month').format('MMM YYYY');

  const rawExpenses = expensesData?.data || [];

  // Period Specific Expenses Filtered dynamically by Date
  const filteredExpenses = useMemo(() => {
    return rawExpenses.filter((e: any) => {
      if (!e.date) return false;
      const expDate = dayjs(e.date);

      if (period === 'this_week') {
        return expDate.isSame(dayjs(), 'week');
      }
      if (period === 'this_month') {
        return expDate.isSame(dayjs(), 'month');
      }
      if (period === 'previous_month') {
        return expDate.isSame(dayjs().subtract(1, 'month'), 'month');
      }
      if (period === 'two_months_ago') {
        return expDate.isSame(dayjs().subtract(2, 'month'), 'month');
      }
      return true;
    });
  }, [rawExpenses, period]);

  // Dynamic Category Breakdown computed from Filtered Period Expenses
  const categoryPieData = useMemo(() => {
    const map: Record<string, { value: number; color?: string }> = {};

    filteredExpenses.forEach((e: any) => {
      const catName = typeof e.category === 'object' ? e.category?.name : (e.category || 'General');
      const catColor = typeof e.category === 'object' ? e.category?.color : undefined;
      const amt = Number(e.amount || 0);

      if (!map[catName]) {
        map[catName] = { value: 0, color: catColor || '#3B82F6' };
      }
      map[catName].value += amt;
    });

    // If no filtered raw expenses yet for this_month, fallback to dashboard category pie
    if (Object.keys(map).length === 0 && period === 'this_month' && dashboardData?.charts?.expenseCategory) {
      return dashboardData.charts.expenseCategory;
    }

    return Object.entries(map).map(([name, data]) => ({
      name,
      value: data.value,
      color: data.color || '#3B82F6',
    }));
  }, [filteredExpenses, period, dashboardData]);

  // Calculate Total Outflow for the selected Period
  const periodOutflow = useMemo(() => {
    const sumFromCategories = categoryPieData.reduce((acc: number, c: any) => acc + (c.value || 0), 0);
    if (sumFromCategories > 0) return sumFromCategories;

    if (period === 'this_week') {
      const weeklyData = dashboardData?.charts?.weeklyComparison || [];
      return weeklyData.reduce((acc: number, w: any) => acc + (w.currentWeek || 0), 0) || Math.round(dashboardData?.stats?.monthlyExpense?.value / 4 || 0);
    }
    if (period === 'this_month') {
      return (dashboardData?.stats?.monthlyExpense?.value || 0) + totalMonthlyCost;
    }
    if (period === 'previous_month' && trendLen >= 2) {
      return monthlyTrends[trendLen - 2]?.expenses || monthlyTrends[trendLen - 2]?.value || 0;
    }
    if (period === 'two_months_ago' && trendLen >= 3) {
      return monthlyTrends[trendLen - 3]?.expenses || monthlyTrends[trendLen - 3]?.value || 0;
    }
    return 0;
  }, [categoryPieData, period, dashboardData, totalMonthlyCost, monthlyTrends, trendLen]);

  // Period Inflow & Budget Metrics
  const periodMetrics = useMemo(() => {
    if (period === 'this_week') {
      const curInc = Math.round((dashboardData?.stats?.income?.value || 0) / 4);
      const budget = Math.round((dashboardData?.stats?.monthlyExpense?.totalBudgetLimit || 10000) / 4);
      return {
        label: 'This Week',
        inflow: curInc,
        outflow: periodOutflow,
        budget: budget,
        remainingBudget: Math.max(0, budget - periodOutflow),
      };
    }

    if (period === 'this_month') {
      const curInc = dashboardData?.stats?.income?.value || 0;
      const budget = dashboardData?.stats?.monthlyExpense?.totalBudgetLimit || (periodOutflow > 0 ? Math.max(periodOutflow, 10000) : 10000);
      return {
        label: 'This Month',
        inflow: curInc,
        outflow: periodOutflow,
        budget: budget,
        remainingBudget: Math.max(0, budget - periodOutflow),
      };
    }

    if (period === 'previous_month' && trendLen >= 2) {
      const p = monthlyTrends[trendLen - 2];
      const inc = p?.income || 0;
      const budget = Math.max(periodOutflow * 1.1, 5000);
      return {
        label: previousMonthLabel,
        inflow: inc,
        outflow: periodOutflow,
        budget: budget,
        remainingBudget: Math.max(0, budget - periodOutflow),
      };
    }

    // two_months_ago
    const p = trendLen >= 3 ? monthlyTrends[trendLen - 3] : null;
    const inc = p?.income || 0;
    const budget = Math.max(periodOutflow * 1.1, 5000);
    return {
      label: twoMonthsAgoLabel,
      inflow: inc,
      outflow: periodOutflow,
      budget: budget,
      remainingBudget: Math.max(0, budget - periodOutflow),
    };
  }, [period, periodOutflow, dashboardData, previousMonthLabel, twoMonthsAgoLabel, monthlyTrends, trendLen]);

  // Dynamic Donut Segments for Inflow vs Outflow vs Budget
  const donutSegments: PortfolioSegment[] = useMemo(() => {
    return [
      { name: 'Total Inflow', value: Math.max(0, periodMetrics.inflow), color: '#10B981' },
      { name: 'Total Outflow', value: Math.max(0, periodMetrics.outflow), color: '#F43F5E' },
      { name: 'Remaining Budget', value: Math.max(0, periodMetrics.remainingBudget), color: '#F59E0B' },
    ];
  }, [periodMetrics]);

  const handleDownloadCSV = async () => {
    try {
      enqueueSnackbar('Compiling financial flow report...', { variant: 'info' });
      const response = await axiosInstance.get('/reports/expenses/csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pfms-flow-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      enqueueSnackbar('Flow report exported successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to export flow report', { variant: 'error' });
    }
  };

  return (
    <div className="space-y-6 text-left font-sans pb-16 max-w-xl mx-auto animate-fade-in">
      <Helmet>
        <title>Financial Reports & Category Outflow — Fintro</title>
      </Helmet>

      {/* Screen Top Header Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-zinc-900 dark:text-white leading-tight">Inflow & Outflow Reports</h1>
          <p className="text-[11px] font-semibold text-zinc-400">Category Outflow Visuals</p>
        </div>
        <button
          type="button"
          onClick={handleDownloadCSV}
          title="Export CSV"
          className="p-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Time Period Filter Switcher Bar: Separating This Week & This Month */}
      <div className="bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 grid grid-cols-4 gap-1 text-center">
        <button
          type="button"
          onClick={() => setPeriod('this_week')}
          className={`py-2 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer truncate ${period === 'this_week'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
        >
          This Week
        </button>
        <button
          type="button"
          onClick={() => setPeriod('this_month')}
          className={`py-2 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer truncate ${period === 'this_month'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
        >
          This Month
        </button>
        <button
          type="button"
          onClick={() => setPeriod('previous_month')}
          className={`py-2 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer truncate ${period === 'previous_month'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
        >
          {previousMonthLabel}
        </button>
        <button
          type="button"
          onClick={() => setPeriod('two_months_ago')}
          className={`py-2 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer truncate ${period === 'two_months_ago'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
        >
          {twoMonthsAgoLabel}
        </button>
      </div>

      {/* Live Financial Flow Donut Chart */}
      <PortfolioDonut
        totalBalance={periodMetrics.inflow}
        currencySymbol={currencySymbol}
        segments={donutSegments}
      />

      {/* Period Highlights: Inflow, Outflow & Total Budget Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Total Inflow</span>
          <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-white mt-1 block truncate">
            {currencySymbol}{periodMetrics.inflow.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Total Outflow</span>
          <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-white mt-1 block truncate">
            {currencySymbol}{periodMetrics.outflow.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Total Budget</span>
          <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-white mt-1 block truncate">
            {currencySymbol}{periodMetrics.budget.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Budget Limit Progress Bar Visual */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-zinc-900 dark:text-white">
          <span>Budget Spent ({periodMetrics.label})</span>
          <span className="text-amber-600 dark:text-amber-400">
            {periodMetrics.budget > 0 ? Math.min(100, Math.round((periodMetrics.outflow / periodMetrics.budget) * 100)) : 0}%
          </span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-rose-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${periodMetrics.budget > 0 ? Math.min(100, Math.round((periodMetrics.outflow / periodMetrics.budget) * 100)) : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-zinc-400 font-medium">
          <span>Spent: {currencySymbol}{periodMetrics.outflow.toLocaleString()}</span>
          <span>Remaining: {currencySymbol}{periodMetrics.remainingBudget.toLocaleString()}</span>
        </div>
      </div>

      {/* Outflow Category Breakdown List (Dynamic Category-Based) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Category Outflow ({periodMetrics.label})
          </h3>
          <button
            type="button"
            onClick={() => navigate(ROUTES.EXPENSES)}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            View Expenses <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {categoryPieData.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <Layers className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">No category expenses recorded for {periodMetrics.label}</p>
            <Button onClick={() => navigate(ROUTES.EXPENSES)} variant="outline" className="mt-3 text-xs rounded-xl">
              + Add Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {categoryPieData.map((cat: any, idx: number) => {
              const details = getCategoryIconDetails(cat.name);
              const pct = periodMetrics.outflow > 0 ? Math.round((cat.value / periodMetrics.outflow) * 100) : 0;
              return (
                <FlowCategoryItem
                  key={idx}
                  name={cat.name}
                  subtitle={`${pct}% of ${periodMetrics.label} outflow`}
                  amount={cat.value}
                  percentage={pct}
                  isPositive={idx % 2 === 0}
                  currencySymbol={currencySymbol}
                  iconBg={details.bg}
                  iconNode={details.icon}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Export & Print Quick Actions */}
      <div className="pt-2 grid grid-cols-2 gap-3">
        <Button onClick={handleDownloadCSV} variant="outline" className="w-full rounded-2xl py-3 text-xs font-extrabold gap-2 border-zinc-200 dark:border-zinc-800 cursor-pointer">
          <Download className="w-4 h-4 text-purple-500" /> Export Flow CSV
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="w-full rounded-2xl py-3 text-xs font-extrabold gap-2 border-zinc-200 dark:border-zinc-800 cursor-pointer">
          <FileText className="w-4 h-4 text-blue-500" /> Print Report PDF
        </Button>
      </div>
    </div>
  );
};

export default Reports;
