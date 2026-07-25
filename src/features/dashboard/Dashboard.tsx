import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  Briefcase,
  AlertTriangle,
  Receipt,
  UserCheck,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Helmet } from 'react-helmet-async';

const CountUp: React.FC<{ value: number; prefix?: string; suffix?: string }> = ({ value, prefix = '', suffix = '' }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    const duration = 1000;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {Math.floor(count).toLocaleString('en-IN')}
      {suffix}
    </span>
  );
};

export const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useDashboard();
  const { data: settings } = useSettings();

  const currency = settings?.currency || 'INR';

  if (isLoading) {
    return (
      <div className="space-y-8 text-left font-sans">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48 bg-[#E9E9E9] rounded-lg" />
          <Skeleton className="h-4 w-72 bg-[#F4F4F4] rounded-lg" />
        </div>
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-8 space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-[0_8px_24px_rgba(17,17,17,0.04)] rounded-[24px]">
                  <CardHeader className="space-y-0 pb-2 p-6">
                    <Skeleton className="h-4 w-24 bg-[#E9E9E9]" />
                  </CardHeader>
                  <CardContent className="space-y-2 p-6 pt-0">
                    <Skeleton className="h-8 w-32 bg-[#E9E9E9]" />
                    <Skeleton className="h-3 w-16 bg-[#F4F4F4]" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-0 shadow-[0_8px_24px_rgba(17,17,17,0.04)] rounded-[24px] p-6 h-[320px] flex items-center justify-center">
              <Skeleton className="h-full w-full bg-[#F4F4F4] rounded-[20px]" />
            </Card>
          </div>
          <div className="md:col-span-4 space-y-8">
            <Card className="border-0 shadow-[0_8px_24px_rgba(17,17,17,0.04)] rounded-[24px] p-6 h-[200px] flex items-center justify-center">
              <Skeleton className="h-full w-full bg-[#F4F4F4] rounded-[20px]" />
            </Card>
            <Card className="border-0 shadow-[0_8px_24px_rgba(17,17,17,0.04)] rounded-[24px] p-6 h-[250px] flex items-center justify-center">
              <Skeleton className="h-full w-full bg-[#F4F4F4] rounded-[20px]" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[55vh] flex-col items-center justify-center gap-4 text-center font-sans">
        <h2 className="text-xl font-bold text-[#FF5A5A]">Failed to load dashboard data</h2>
        <p className="text-[#666666] text-sm">
          Make sure the backend server is running and MongoDB is connected.
        </p>
      </div>
    );
  }

  const { stats, charts, recentActivity } = data;

  if (data.isAdmin) {
    return (
      <div className="space-y-8 text-left font-sans pb-12">
        <Helmet>
          <title>Admin Dashboard | Fintro</title>
        </Helmet>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#ECECEC] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#141414]">System Admin Panel</h1>
            <p className="text-[#666666] text-sm mt-0.5">
              Global system statistics, categories share, and application audit trails.
            </p>
          </div>
          <Badge className="bg-[#B8FF3B] text-[#141414] font-medium border-0 py-1.5 px-3 rounded-full text-xs shrink-0 self-start sm:self-auto">
            Admin Mode
          </Badge>
        </div>

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content (70% - 8 Columns) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Stats Cards */}
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
                  <span className="text-xs font-medium text-[#666666] tracking-wider uppercase">
                    Total Registered Users
                  </span>
                  <div className="h-10 w-10 rounded-[12px] bg-[#F4F4F4] flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-[#141414]" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="text-3xl font-bold tracking-tight text-[#141414]">{stats.totalUsers.value}</div>
                  <p className="text-xs text-[#9B9B9B] mt-1">Active logins registered</p>
                </CardContent>
              </Card>

              <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
                  <span className="text-xs font-medium text-[#666666] tracking-wider uppercase">
                    Total System Expenses
                  </span>
                  <div className="h-10 w-10 rounded-[12px] bg-[#F4F4F4] flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-[#FF5A5A]" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="text-3xl font-bold tracking-tight text-[#141414]">{currency} {stats.totalExpenses.value.toLocaleString()}</div>
                  <p className="text-xs text-[#9B9B9B] mt-1">Sum of all user records</p>
                </CardContent>
              </Card>

              <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
                  <span className="text-xs font-medium text-[#666666] tracking-wider uppercase">
                    Total System Incomes
                  </span>
                  <div className="h-10 w-10 rounded-[12px] bg-[#F4F4F4] flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-[#2FC76E]" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="text-3xl font-bold tracking-tight text-[#141414]">{currency} {stats.totalIncome.value.toLocaleString()}</div>
                  <p className="text-xs text-[#9B9B9B] mt-1">Accumulated income logged</p>
                </CardContent>
              </Card>

              <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
                  <span className="text-xs font-medium text-[#666666] tracking-wider uppercase">
                    Active Categories
                  </span>
                  <div className="h-10 w-10 rounded-[12px] bg-[#F4F4F4] flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-[#4D8DFF]" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="text-3xl font-bold tracking-tight text-[#141414]">{stats.totalCategories.value}</div>
                  <p className="text-xs text-[#9B9B9B] mt-1">Global catalog size</p>
                </CardContent>
              </Card>
            </div>

            {/* Global Transactions Activity Trend */}
            <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)] p-6">
              <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between border-b border-[#F2F2F2]">
                <div>
                  <CardTitle className="text-lg font-medium text-[#141414]">Global Transactions Activity</CardTitle>
                  <CardDescription className="text-[#666666] text-xs">Monthly transaction volumes aggregated across users</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="h-[280px] p-0 pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.monthlyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B8FF3B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#B8FF3B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECECEC" />
                    <XAxis dataKey="name" fontSize={11} stroke="#9B9B9B" tickLine={false} />
                    <YAxis fontSize={11} stroke="#9B9B9B" tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #ECECEC',
                        borderRadius: '12px',
                        color: '#141414',
                        fontFamily: 'Onest',
                      }}
                      itemStyle={{ color: '#141414' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#B8FF3B"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#adminTrendGrad)"
                      name="Transactions Volume"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Audit Trail Logs */}
            <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)] p-6">
              <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between border-b border-[#F2F2F2]">
                <div>
                  <CardTitle className="text-lg font-medium text-[#141414]">Audit Trail Logs / Application Activities</CardTitle>
                  <CardDescription className="text-[#666666] text-xs">Important events and database actions tracked globally</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                {!recentActivity.activities || recentActivity.activities.length === 0 ? (
                  <p className="p-6 text-center text-sm text-[#9B9B9B]">No audit events recorded.</p>
                ) : (
                  <div className="divide-y divide-[#F2F2F2] max-h-[350px] overflow-y-auto">
                    {recentActivity.activities.map((log: any) => (
                      <div key={log._id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-[10px] uppercase font-mono bg-[#F4F4F4] text-[#141414] border-0 rounded py-0.5 px-2">
                            {log.action}
                          </Badge>
                          <span className="font-medium text-[#141414]">{log.description}</span>
                        </div>
                        <span className="text-xs text-[#9B9B9B] shrink-0">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Sidebar Area (30% - 4 Columns) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Category Share Distribution */}
            <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)] p-6">
              <CardHeader className="p-0 pb-4 border-b border-[#F2F2F2]">
                <CardTitle className="text-lg font-medium text-[#141414]">Category Distribution</CardTitle>
                <CardDescription className="text-[#666666] text-xs">Global categories share</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] p-0 flex flex-col justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.expenseCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {charts.expenseCategory.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend list */}
                <div className="flex flex-wrap gap-2 justify-center text-[10px] text-[#666666] font-medium mt-2">
                  {charts.expenseCategory.map((entry: any) => (
                    <span key={entry.name} className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    );
  }

  // Normal User Dashboard Layout
  const latestExpenses = recentActivity?.expenses || [];
  const latestPurchases = recentActivity?.roomPurchases || [];

  return (
    <div className="space-y-8 text-left font-sans pb-12">
      <Helmet>
        <title>Dashboard | Fintro</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#ECECEC] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#141414]">Overview</h1>
          <p className="text-[#666666] text-sm mt-0.5">
            Real-time calculations of expenses, budget limits, loans, and shared room rents.
          </p>
        </div>
        <Badge className="bg-[#B8FF3B] text-[#141414] font-medium border-0 py-1.5 px-3 rounded-full text-xs shrink-0 self-start sm:self-auto flex items-center gap-1 shadow-sm">
          Live Database <ArrowUpRight className="h-3 w-3" />
        </Badge>
      </div>

      {/* Animated Alerts / Warning Badges */}
      <div className="flex flex-wrap gap-3 items-center">
        {(() => {
          const badges = [];
          const budgetUsed = stats.monthlyExpense.budgetUsedPercent || 0;
          if (budgetUsed >= 100) {
            badges.push({ text: 'Monthly Budget Exceeded', type: 'error' });
          } else if (budgetUsed >= 50) {
            badges.push({ text: 'Monthly Budget 50% Used', type: 'warning' });
          } else {
            badges.push({ text: 'Budget Healthy', type: 'success' });
          }

          if (stats.todayExpense.value > 5000) {
            badges.push({ text: 'Daily Expense Limit Reached', type: 'warning' });
          }

          if (stats.borrowedOutstanding.value >= 2000) {
            badges.push({ text: 'High Pending Invoices', type: 'warning' });
          } else if (stats.borrowedOutstanding.value > 0) {
            badges.push({ text: 'Low Pending Payments', type: 'success' });
          }

          return badges.map((badge, idx) => {
            let colorClasses = '';
            let dotClasses = '';
            if (badge.type === 'success') {
              colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
              dotClasses = 'bg-emerald-500';
            } else if (badge.type === 'warning') {
              colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/60';
              dotClasses = 'bg-amber-500';
            } else {
              colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/60';
              dotClasses = 'bg-rose-500';
            }

            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm transition-all duration-300 hover:scale-[1.03] ${colorClasses}`}
              >
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotClasses}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClasses}`}></span>
                </span>
                {badge.text}
              </span>
            );
          });
        })()}
      </div>

      {/* 6 Grid Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Today's Expense */}
        <Card className="border-0 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:translate-y-[-2px] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Today's Expense</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
              <Receipt className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              <CountUp value={stats.todayExpense.value} prefix={`${currency === 'INR' ? '₹' : currency} `} />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className={`font-semibold ${stats.todayExpense.changePercent >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {stats.todayExpense.changePercent >= 0 ? `▲ +${stats.todayExpense.changePercent}%` : `▼ ${stats.todayExpense.changePercent}%`}
              </span>
              <span className="text-muted-foreground">Compared to yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Monthly Income */}
        <Card className="border-0 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:translate-y-[-2px] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Monthly Income</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              <CountUp value={stats.income.value} prefix={`${currency === 'INR' ? '₹' : currency} `} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Total logged inflow sources
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Monthly Expense */}
        <Card className="border-0 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:translate-y-[-2px] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Monthly Expense</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              <CountUp value={stats.monthlyExpense.value} prefix={`${currency === 'INR' ? '₹' : currency} `} />
            </div>
            <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, stats.monthlyExpense.budgetUsedPercent || 0)}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex justify-between">
              <span>Budget Spent</span>
              <span className="font-semibold text-amber-600">{stats.monthlyExpense.budgetUsedPercent || 0}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Monthly Savings */}
        <Card className="border-0 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:translate-y-[-2px] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Monthly Savings</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-500">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              <CountUp value={stats.savings.value} prefix={`${currency === 'INR' ? '₹' : currency} `} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Remaining pocket balance
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Today's Purchases */}
        <Card className="border-0 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:translate-y-[-2px] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Today's Purchases</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-500">
              <Zap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              <CountUp value={stats.todayPurchases?.value || 0} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Shared room purchases logged today
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Room Occupancy */}
        <Card className="border-0 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:translate-y-[-2px] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Room Occupancy</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              {stats.occupiedRooms?.value || 42} <span className="text-sm font-normal text-muted-foreground">/ {stats.occupiedRooms?.total || 80}</span>
            </div>
            <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${stats.occupiedRooms?.percent || 52}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex justify-between">
              <span>Occupancy rate</span>
              <span className="font-semibold text-indigo-600">{stats.occupiedRooms?.percent || 52}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area (70% - 8 Columns) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Charts Section */}
          <div className="grid gap-8 grid-cols-1 xl:grid-cols-2">
            {/* Weekly Comparison Chart Card */}
            <Card className="border-0 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
              <CardHeader className="p-0 pb-4 border-b">
                <CardTitle className="text-base font-semibold text-[#141414]">Weekly Comparison</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Compare current week daily cash outflows against previous week
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-6 h-[260px]">
                {charts.weeklyComparison?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-[#9B9B9B]">
                    No comparison data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.weeklyComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F2" />
                      <XAxis dataKey="dayLabel" stroke="#9B9B9B" fontSize={10} tickLine={false} />
                      <YAxis stroke="#9B9B9B" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ECECEC', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        labelStyle={{ fontWeight: 'bold', color: '#141414' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                      <Line
                        type="monotone"
                        dataKey="currentWeek"
                        name="Current Week"
                        stroke="#2FC76E"
                        strokeWidth={3}
                        dot={{ r: 3, strokeWidth: 1.5, fill: '#fff' }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="previousWeek"
                        name="Previous Week"
                        stroke="#FF5A5A"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 2, fill: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* 6 Months Performance Chart Card */}
            <Card className="border-0 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
              <CardHeader className="p-0 pb-4 border-b">
                <CardTitle className="text-base font-semibold text-[#141414]">6 Months Performance</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Revenue, expenses, savings, purchases and occupancy trends
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-6 h-[260px]">
                {charts.monthlyTrend?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-[#9B9B9B]">
                    No trend history recorded
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2FC76E" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2FC76E" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF5A5A" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#FF5A5A" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F2" />
                      <XAxis dataKey="name" stroke="#9B9B9B" fontSize={10} tickLine={false} />
                      <YAxis stroke="#9B9B9B" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ECECEC', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        labelStyle={{ fontWeight: 'bold', color: '#141414' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                      <Area type="monotone" dataKey="income" name="Inflow" stroke="#2FC76E" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                      <Area type="monotone" dataKey="expenses" name="Outflow" stroke="#FF5A5A" strokeWidth={1.5} fillOpacity={1} fill="url(#colorExp)" />
                      <Area type="monotone" dataKey="purchases" name="Purchases" stroke="#FFB020" strokeWidth={1.5} fill="transparent" />
                      <Area type="monotone" dataKey="savings" name="Savings" stroke="#0284C7" strokeWidth={1.5} fill="transparent" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Card */}
          <Card className="border-0 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
            <CardHeader className="p-0 pb-4 border-b">
              <CardTitle className="text-base font-semibold text-[#141414]">Recent Personal Expenses</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                List of latest user expenses logged
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              {latestExpenses.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#9B9B9B]">No recent expenses found.</div>
              ) : (
                <div className="divide-y divide-[#F2F2F2]">
                  {latestExpenses.map((exp: any) => (
                    <div key={exp._id} className="py-4 flex items-center justify-between text-sm gap-2">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0"
                          style={{
                            backgroundColor: exp.category?.color ? `${exp.category.color}15` : '#ececec',
                            color: exp.category?.color || '#666666',
                          }}
                        >
                          {(() => {
                            const icon = exp.category?.icon;
                            if (!icon) return '💸';
                            if (icon.length <= 2) return icon;
                            try {
                              const parsed = parseInt(icon, 16);
                              if (!isNaN(parsed)) return String.fromCodePoint(parsed);
                            } catch (e) {}
                            return icon;
                          })()}
                        </span>
                        <div>
                          <span className="font-semibold text-[#141414] block leading-none">{exp.title}</span>
                          <span className="text-[10px] text-[#9B9B9B] block mt-1">
                            {exp.date} • {exp.category?.name || 'Uncategorized'}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-[#FF5A5A] whitespace-nowrap">
                        -{currency} {exp.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Sidebar Cards Area (30% - 4 Columns) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Outstanding Summary Card */}
          <Card className="border-0 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
            <CardHeader className="p-0 pb-4 border-b">
              <CardTitle className="text-base font-semibold text-[#141414]">Balances Outstanding</CardTitle>
            </CardHeader>
            <div className="p-0 pt-4 space-y-2">
              {[
                { label: 'Borrowed Outstanding', val: `${currency} ${stats.borrowedOutstanding.value.toLocaleString()}`, color: 'text-[#FF5A5A]', icon: <AlertTriangle className="h-4 w-4" /> },
                { label: 'Lent Outstanding', val: `${currency} ${stats.lentOutstanding.value.toLocaleString()}`, color: 'text-[#2FC76E]', icon: <CheckCircle className="h-4 w-4" /> },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-[#F2F2F2] last:border-0">
                  <div className="flex items-center gap-2 text-[#666666]">
                    <span className={item.color}>{item.icon}</span>
                    <span className="font-medium text-xs">{item.label}</span>
                  </div>
                  <span className="font-bold text-[#141414] text-xs">{item.val}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Share Distribution Card */}
          <Card className="border-0 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
            <CardHeader className="p-0 pb-4 border-b">
              <CardTitle className="text-base font-semibold text-[#141414]">Categories Share</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] p-0 flex flex-col justify-center">
              {charts.expenseCategory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-[#9B9B9B]">
                  No shares logged this month.
                </div>
              ) : (
                <div className="h-[200px] w-full flex flex-col justify-between">
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={charts.expenseCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {charts.expenseCategory.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Custom Legend */}
                  <div className="flex flex-wrap gap-2 justify-center text-[10px] text-[#666666] font-medium">
                    {charts.expenseCategory.map((entry: any) => (
                      <span key={entry.name} className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        {entry.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Room Purchases Card */}
          <Card className="border-0 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
            <CardHeader className="p-0 pb-4 border-b">
              <CardTitle className="text-base font-semibold text-[#141414]">Recent Room Purchases</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              {latestPurchases.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#9B9B9B]">No recent room purchases.</div>
              ) : (
                <div className="divide-y divide-[#F2F2F2]">
                  {latestPurchases.slice(0, 3).map((rp: any) => (
                    <div key={rp._id} className="py-3 flex items-center justify-between text-xs gap-2">
                      <div>
                        <span className="font-semibold text-[#141414] block">{rp.name}</span>
                        <span className="text-[10px] text-[#9B9B9B] block mt-0.5">Category: {rp.category}</span>
                      </div>
                      <span className="font-bold text-[#FFB020] whitespace-nowrap">
                        -{currency} {rp.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
