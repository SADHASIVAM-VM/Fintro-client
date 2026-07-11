import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
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
  const primaryStats = [
    {
      title: "Today's Expense",
      value: `${currency} ${stats.todayExpense.value.toLocaleString()}`,
      description: 'Daily cash outflow',
      icon: <Receipt className="h-5 w-5 text-[#FF5A5A]" />,
      colorClass: 'text-[#FF5A5A]',
      bgClass: 'bg-[#FF5A5A]/10',
    },
    {
      title: "Monthly Income",
      value: `${currency} ${stats.income.value.toLocaleString()}`,
      description: 'Logged resources',
      icon: <Briefcase className="h-5 w-5 text-[#2FC76E]" />,
      colorClass: 'text-[#2FC76E]',
      bgClass: 'bg-[#2FC76E]/10',
    },
    {
      title: "Monthly Expense",
      value: `${currency} ${stats.monthlyExpense.value.toLocaleString()}`,
      description: 'Accumulated this month',
      icon: <TrendingDown className="h-5 w-5 text-[#FF5A5A]" />,
      colorClass: 'text-[#FF5A5A]',
      bgClass: 'bg-[#FF5A5A]/10',
    },
    {
      title: "Monthly Savings",
      value: `${currency} ${stats.savings.value.toLocaleString()}`,
      description: 'Income minus expenses',
      icon: <TrendingUp className="h-5 w-5 text-[#2FC76E]" />,
      colorClass: 'text-[#2FC76E]',
      bgClass: 'bg-[#2FC76E]/10',
    },
  ];

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

      {/* 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area (70% - 8 Columns) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Top Primary Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {primaryStats.map((card, idx) => (
              <Card key={idx} className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)] hover:scale-[1.01] transition-transform duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
                  <span className="text-xs font-semibold text-[#666666] tracking-wider uppercase">
                    {card.title}
                  </span>
                  <div className={`h-10 w-10 rounded-[12px] flex items-center justify-center ${card.bgClass}`}>
                    {card.icon}
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141414]">{card.value}</div>
                  <p className="text-xs text-[#9B9B9B] mt-1">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cashflow Trend Area Chart */}
          <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)] p-6">
            <CardHeader className="p-0 pb-6 border-b border-[#F2F2F2] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium text-[#141414]">Cashflow Trend</CardTitle>
                <CardDescription className="text-[#666666] text-xs">
                  Past 6 months comparison of monthly incomes, payouts, and net savings.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] p-0 pt-6 pr-4">
              {charts.monthlyTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-[#9B9B9B]">
                  Insufficient data to render trend. Log more transactions.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.monthlyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="userTrendGrad" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#userTrendGrad)"
                      name={`Expenses (${currency})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Large Feature Container: Recent Expense Logs */}
          <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)] p-6">
            <CardHeader className="p-0 pb-6 border-b border-[#F2F2F2]">
              <CardTitle className="text-lg font-medium text-[#141414]">Recent Expense Logs</CardTitle>
              <CardDescription className="text-[#666666] text-xs">Latest payouts ledger transactions</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              {recentActivity.expenses.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#9B9B9B]">No recent expenses.</div>
              ) : (
                <div className="divide-y divide-[#F2F2F2]">
                  {recentActivity.expenses.map((exp: any) => (
                    <div key={exp._id} className="py-4 flex items-center justify-between text-sm gap-2">
                      <div className="flex items-center gap-3">
                        {/* Circle placeholder style for items */}
                        <div className="h-10 w-10 rounded-full bg-[#F4F4F4] flex items-center justify-center text-[#141414]">
                          <Receipt className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="font-medium text-[#141414] block">{exp.title}</span>
                          <span className="text-xs text-[#9B9B9B] block mt-0.5">{exp.date}</span>
                        </div>
                      </div>
                      <span className="font-bold text-[#FF5A5A]">
                        -{currency} {exp.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Utility Sidebar (30% - 4 Columns) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Room Rent & Utility Bills Status cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {/* Rent */}
            <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)] p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#666666] uppercase block tracking-wider">Room Rent Status</span>
                <span className="text-lg font-bold block mt-1 text-[#141414]">{stats.roomRentStatus.value}</span>
              </div>
              <Badge className={`h-fit py-1 px-2.5 rounded-full border-0 font-medium text-xs ${stats.roomRentStatus.value === 'Paid' ? 'bg-[#2FC76E]/10 text-[#2FC76E]' : 'bg-[#FF5A5A]/10 text-[#FF5A5A]'}`}>
                {stats.roomRentStatus.value === 'Paid' ? 'Settled' : 'Unpaid'}
              </Badge>
            </Card>
            {/* Utilities */}
            <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)] p-6 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#F5B400]/10 text-[#F5B400] rounded-[12px] flex items-center justify-center shrink-0">
                  <Zap className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#666666] uppercase block tracking-wider">Utility Bills</span>
                  <span className="text-lg font-bold block mt-1 text-[#141414]">{stats.roomBillsStatus.value}</span>
                </div>
              </div>
              <Badge className={`h-fit py-1 px-2.5 rounded-full border-0 font-medium text-xs ${stats.roomBillsStatus.value === 'All Paid' ? 'bg-[#2FC76E]/10 text-[#2FC76E]' : 'bg-[#FF5A5A]/10 text-[#FF5A5A]'}`}>
                {stats.roomBillsStatus.value === 'All Paid' ? 'Paid' : 'Pending'}
              </Badge>
            </Card>
          </div>

          {/* Dues Details List Card */}
          <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)] p-6 space-y-4">
            <h4 className="font-semibold text-sm text-[#141414] uppercase tracking-wider">Pending Dues</h4>
            <div className="space-y-4">
              {[
                { label: 'Remaining Budget', val: `${currency} ${stats.remainingBudget.value.toLocaleString()}`, color: 'text-[#4D8DFF]', icon: <DollarSign className="h-4 w-4" /> },
                { label: 'Upcoming EMIs', val: `${currency} ${stats.upcomingEmi.value.toLocaleString()}`, color: 'text-[#F5B400]', icon: <Clock className="h-4 w-4" /> },
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
          <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)] p-6">
            <CardHeader className="p-0 pb-4 border-b border-[#F2F2F2]">
              <CardTitle className="text-base font-medium text-[#141414]">Categories Share</CardTitle>
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
          <Card className="border-0 rounded-[24px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)] p-6">
            <CardHeader className="p-0 pb-4 border-b border-[#F2F2F2]">
              <CardTitle className="text-base font-medium text-[#141414]">Recent Room Purchases</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              {recentActivity.roomPurchases.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#9B9B9B]">No recent room purchases.</div>
              ) : (
                <div className="divide-y divide-[#F2F2F2]">
                  {recentActivity.roomPurchases.slice(0, 3).map((rp: any) => (
                    <div key={rp._id} className="py-3 flex items-center justify-between text-xs gap-2">
                      <div>
                        <span className="font-semibold text-[#141414] block">{rp.name}</span>
                        <span className="text-[10px] text-[#9B9B9B] block mt-0.5">Category: {rp.category}</span>
                      </div>
                      <span className="font-bold text-[#F5B400]">
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
