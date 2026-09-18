import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import {
  Smartphone,
  Zap,
  Wifi,
  Home as HomeIcon,
  Tv,
  Plus,
  Bell,
  Trash2,
  RefreshCw,
  RotateCw,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import dayjs from 'dayjs';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { axiosInstance } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { DateCalendarBar, type BillCalendarEvent } from '@/components/ui/DateCalendarBar';
import { Helmet } from 'react-helmet-async';
import { cn } from '@/lib/utils';

// Recurring bill schema
const recurringBillSchema = z.object({
  name: z.string().min(2, 'Bill name is required'),
  cost: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be greater than 0',
  }),
  dueDay: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 1 && num <= 31;
  }, { message: 'Day of month must be between 1 and 31' }),
  category: z.string().optional(),
  billingCycle: z.enum(['monthly', 'yearly']),
  reminderDays: z.string().optional(),
});

type RecurringBillSchema = z.infer<typeof recurringBillSchema>;

// Quick preset bill templates for easy one-click creation
const PRESET_TEMPLATES = [
  { name: 'Mobile Recharge', cost: '499', dueDay: '5', category: 'Mobile', icon: Smartphone, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
  { name: 'Electricity Bill', cost: '1200', dueDay: '10', category: 'Utilities', icon: Zap, color: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' },
  { name: 'Wi-Fi Broadband', cost: '799', dueDay: '1', category: 'Internet', icon: Wifi, color: 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400' },
  { name: 'House Rent', cost: '12000', dueDay: '1', category: 'Housing', icon: HomeIcon, color: 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400' },
  { name: 'OTT / Streaming', cost: '199', dueDay: '15', category: 'Entertainment', icon: Tv, color: 'bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400' },
];

export const Subscriptions: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const {
    subscriptions: apiSubs,
    isLoading,
    isRefetching,
    refetch,
    createSubscription,
    deleteSubscription
  } = useSubscriptions();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [paidStatusMap, setPaidStatusMap] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecurringBillSchema>({
    resolver: zodResolver(recurringBillSchema),
    defaultValues: {
      name: '',
      cost: '',
      dueDay: '5',
      category: 'General',
      billingCycle: 'monthly',
      reminderDays: '2',
    },
  });

  // Map API items directly to bill list (local presets are strictly for Quick Add)
  const allBills = useMemo(() => {
    return (apiSubs || []).map((sub: any) => {
      const dueDayNum = sub.nextBillingDate ? dayjs(sub.nextBillingDate).date() : 5;
      const isPaid = paidStatusMap[sub._id] !== undefined
        ? paidStatusMap[sub._id]
        : (sub.status === 'paid' || !!sub.isPaidThisMonth);

      return {
        _id: sub._id,
        name: sub.name,
        cost: sub.cost,
        dueDay: dueDayNum,
        billingCycle: sub.billingCycle || 'monthly',
        category: sub.category || (typeof sub.categoryId === 'object' ? sub.categoryId?.name : sub.categoryId) || 'General',
        isPaidThisMonth: isPaid,
        reminderEnabled: true,
        reminderDays: 2,
        status: sub.status,
      };
    });
  }, [apiSubs, paidStatusMap]);

  // Derived calendar assigned bill events with green (paid) vs amber (pending due) indicators
  const calendarEvents: BillCalendarEvent[] = useMemo(() => {
    return allBills.map((b) => {
      const dueDayNum = Number(b.dueDay || 5);
      const combined = (b.name + ' ' + (b.category || '')).toLowerCase();

      let icon = RefreshCw;

      if (combined.includes('mobile') || combined.includes('recharge')) {
        icon = Smartphone;
      } else if (combined.includes('elec') || combined.includes('power')) {
        icon = Zap;
      } else if (combined.includes('wifi') || combined.includes('internet') || combined.includes('broadband')) {
        icon = Wifi;
      } else if (combined.includes('rent') || combined.includes('house')) {
        icon = HomeIcon;
      } else if (combined.includes('ott') || combined.includes('netflix') || combined.includes('tv')) {
        icon = Tv;
      }

      return {
        day: dueDayNum,
        icon,
        isPaid: !!b.isPaidThisMonth,
        name: b.name,
      };
    });
  }, [allBills]);

  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setValue('name', preset.name);
    setValue('cost', preset.cost);
    setValue('dueDay', preset.dueDay);
    setValue('category', preset.category);
    setIsAddOpen(true);
  };

  const onSubmit = async (data: RecurringBillSchema) => {
    try {
      const nextDate = dayjs().set('date', Number(data.dueDay)).format('YYYY-MM-DD');
      await createSubscription({
        name: data.name,
        cost: Number(data.cost),
        billingCycle: data.billingCycle as any,
        nextBillingDate: nextDate,
      });

      await refetch();
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      enqueueSnackbar(`Recurring bill "${data.name}" added for day ${data.dueDay} of every month!`, { variant: 'success' });
      setIsAddOpen(false);
      reset();
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to add recurring bill', { variant: 'error' });
    }
  };

  const handleMarkAsPaid = async (bill: any) => {
    const billId = bill._id;
    const nextPaidState = !bill.isPaidThisMonth;

    // Toggle paid status in state map
    setPaidStatusMap((prev) => ({
      ...prev,
      [billId]: nextPaidState,
    }));

    if (nextPaidState) {
      try {
        // Record as an expense transaction for budget/expense tracking
        await axiosInstance.post('/expenses', {
          title: `${bill.name} Monthly Payment`,
          amount: bill.cost,
          date: dayjs().format('YYYY-MM-DD'),
          paymentMode: 'UPI/Online',
          notes: `Paid recurring bill: ${bill.name}`,
        });
      } catch {
        // Transaction optional
      }

      try {
        await updateSubscription({ id: billId, data: { status: 'paid' } });
      } catch {
        // API update optional
      }

      await refetch();
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });

      enqueueSnackbar(`Marked ${bill.name} (₹${bill.cost}) as PAID for this month!`, { variant: 'success' });
    } else {
      try {
        await updateSubscription({ id: billId, data: { status: 'active' } });
      } catch {
        // API update optional
      }

      await refetch();
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      enqueueSnackbar(`Marked ${bill.name} as pending`, { variant: 'info' });
    }
  };

  const handleDeleteBill = async (id: string) => {
    try {
      await deleteSubscription(id);
      setPaidStatusMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      enqueueSnackbar('Recurring bill deleted', { variant: 'info' });
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to delete bill', { variant: 'error' });
    }
  };

  const handleManualRefetch = async () => {
    try {
      enqueueSnackbar('Refetching live recurring bills...', { variant: 'info' });
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      enqueueSnackbar('Bills refreshed successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to refetch bills', { variant: 'error' });
    }
  };  // Helper icon for bill category with Two-Tone Gradient Badges
  const getTwoToneBillIcon = (name: string, category: string) => {
    const combined = (name + ' ' + category).toLowerCase();
    if (combined.includes('mobile') || combined.includes('recharge') || combined.includes('phone')) {
      return {
        icon: Smartphone,
        style: 'bg-gradient-to-br from-emerald-400/20 via-teal-500/10 to-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-700/40',
      };
    }
    if (combined.includes('elec') || combined.includes('power') || combined.includes('light')) {
      return {
        icon: Zap,
        style: 'bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-300/40 dark:border-amber-700/40',
      };
    }
    if (combined.includes('wifi') || combined.includes('internet') || combined.includes('broadband')) {
      return {
        icon: Wifi,
        style: 'bg-gradient-to-br from-sky-400/20 via-blue-500/10 to-sky-500/25 text-sky-600 dark:text-sky-400 border border-sky-300/40 dark:border-sky-700/40',
      };
    }
    if (combined.includes('rent') || combined.includes('house')) {
      return {
        icon: HomeIcon,
        style: 'bg-gradient-to-br from-purple-400/20 via-indigo-500/10 to-purple-500/25 text-purple-600 dark:text-purple-400 border border-purple-300/40 dark:border-purple-700/40',
      };
    }
    if (combined.includes('ott') || combined.includes('netflix') || combined.includes('spotify') || combined.includes('tv')) {
      return {
        icon: Tv,
        style: 'bg-gradient-to-br from-pink-400/20 via-rose-500/10 to-pink-500/25 text-pink-600 dark:text-pink-400 border border-pink-300/40 dark:border-pink-700/40',
      };
    }
    return {
      icon: RefreshCw,
      style: 'bg-gradient-to-br from-indigo-400/20 via-violet-500/10 to-indigo-500/25 text-indigo-600 dark:text-indigo-400 border border-indigo-300/40 dark:border-indigo-700/40',
    };
  };

  // Calculate totals
  const totalMonthlyCommitments = allBills.reduce((sum, b) => sum + Number(b.cost || 0), 0);
  const paidThisMonthTotal = allBills.filter((b) => b.isPaidThisMonth).reduce((sum, b) => sum + Number(b.cost || 0), 0);
  const remainingDueTotal = Math.max(0, totalMonthlyCommitments - paidThisMonthTotal);

  const currentDay = dayjs().date();

  // Filter bills list by active Tab and selected Date
  const filteredBills = useMemo(() => {
    return allBills.filter((b) => {
      const dueDayNum = Number(b.dueDay || 5);
      if (selectedDate !== null && dueDayNum !== selectedDate) {
        return false;
      }
      if (activeTab === 'paid') return b.isPaidThisMonth;
      if (activeTab === 'upcoming') return !b.isPaidThisMonth;
      return true;
    });
  }, [allBills, activeTab, selectedDate]);

  return (
    <div className="space-y-6 text-left font-sans pb-16 max-w-xl mx-auto animate-fade-in">
      <Helmet>
        <title>Recurring Bills & Reminders — Finsight</title>
      </Helmet>

      {/* Header Banner */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Recurring Bills</span>
              <button
                type="button"
                onClick={handleManualRefetch}
                className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                title="Refetch Live Bills"
              >
                <RotateCw className={cn('w-4 h-4', isRefetching && 'animate-spin text-purple-600')} />
              </button>
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Auto-reminders & monthly payment tracking
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-xs font-extrabold transition-all shadow-md cursor-pointer shrink-0"
          title="Add Recurring Bill"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline sm:ml-1.5">Add Recurring Bill</span>
        </button>
      </div>

      {/* Monthly Cost Summary Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center">
        <div className="border-r border-zinc-100 dark:border-zinc-800 pr-2">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Monthly Total</span>
          <span className="text-base font-extrabold text-zinc-900 dark:text-white mt-1 block truncate">
            ₹{totalMonthlyCommitments.toLocaleString()}
          </span>
        </div>
        <div className="border-r border-zinc-100 dark:border-zinc-800 px-2">
          <span className="text-[10px] uppercase font-bold text-emerald-500 block tracking-wider">Paid</span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block truncate">
            ₹{paidThisMonthTotal.toLocaleString()}
          </span>
        </div>
        <div className="pl-2">
          <span className="text-[10px] uppercase font-bold text-amber-500 block tracking-wider">Pending Due</span>
          <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-1 block truncate">
            ₹{remainingDueTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Quick Presets Bar (Easy One-Click Add) */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block">
          ⚡ Quick Presets (Click to add)
        </span>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {PRESET_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => applyPreset(tmpl)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm whitespace-nowrap transition-all group shrink-0 cursor-pointer"
            >
              <div className={`p-1.5 rounded-xl ${tmpl.color}`}>
                <tmpl.icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-zinc-900 dark:text-white block leading-none">{tmpl.name}</span>
                <span className="text-[10px] text-zinc-400 font-medium">₹{tmpl.cost} on {tmpl.dueDay}th</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Date Calendar Bar with "This Month" vs "This Week" Top Right Filter */}
      <DateCalendarBar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        billEvents={calendarEvents}
      />

      {/* Tab Switcher */}
      <SegmentedControl
        options={[
          { id: 'upcoming', label: 'Upcoming Bills' },
          { id: 'paid', label: 'Paid This Month' },
          { id: 'all', label: 'All Bills' },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      {/* Recurring Bills List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Monthly Schedule</span>
            {selectedDate !== null && (
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                title="Show All Bills"
              >
                Day {selectedDate} Filter • Show All <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <span className="text-xs font-semibold text-zinc-400">{filteredBills.length} Active Bills</span>
        </h3>

        {isLoading ? (
          <div className="py-12 flex justify-center"><LoadingSpinner /></div>
        ) : filteredBills.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {selectedDate !== null
                ? `No bills scheduled on day ${selectedDate} of the month.`
                : 'No recurring bills matching criteria.'}
            </p>
            {selectedDate !== null && (
              <Button
                onClick={() => setSelectedDate(null)}
                variant="outline"
                className="text-xs rounded-full py-1.5 px-4 font-bold border-zinc-200 dark:border-zinc-700"
              >
                Show All Bills
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredBills.map((bill) => {
              const dueDayNum = Number(bill.dueDay || 5);
              const isPaid = bill.isPaidThisMonth;
              const isDueSoon = !isPaid && dueDayNum >= currentDay && dueDayNum <= currentDay + 5;
              const isOverdue = !isPaid && dueDayNum < currentDay;
              const duotone = getTwoToneBillIcon(bill.name, bill.category || '');
              const IconComp = duotone.icon;

              return (
                <div key={bill._id} className="py-3 flex items-center justify-between group gap-2.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${duotone.style}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">{bill.name}</h4>
                        {isPaid ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
                            Paid
                          </span>
                        ) : isDueSoon ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 animate-pulse shrink-0">
                            Due Soon
                          </span>
                        ) : isOverdue ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                            Overdue
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap truncate block">
                        <span>Due on {dueDayNum}th of month</span>
                        {bill.reminderEnabled && (
                          <span className="flex items-center gap-0.5 text-sky-500 font-semibold">
                            <Bell className="w-3 h-3" /> Remind
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-1">
                    <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white">
                      ₹{bill.cost.toLocaleString()}
                    </span>

                    {/* Interactive Mark as Paid Button (Responsive) */}
                    <button
                      type="button"
                      onClick={() => handleMarkAsPaid(bill)}
                      className={`p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${isPaid
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 shadow-sm'
                        }`}
                      title={isPaid ? 'Mark as Pending' : 'Pay Now'}
                    >
                      <span className="sm:hidden">{isPaid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : 'Pay'}</span>
                      <span className="hidden sm:inline">{isPaid ? '✓ Paid' : 'Pay Now'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBill(bill._id)}
                      className="text-zinc-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                      title="Delete bill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Recurring Bill Dialog Modal */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Set Up Monthly Recurring Bill">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 font-sans">
          <div>
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Bill Name / Service</label>
            <Input {...register('name')} placeholder="e.g. Mobile Recharge, House Rent, Netflix" className="mt-1" />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Monthly Amount (₹)</label>
              <Input {...register('cost')} type="number" placeholder="499" className="mt-1" />
              {errors.cost && <p className="text-xs text-rose-500 mt-1">{errors.cost.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Day of Month (1-31)</label>
              <Input {...register('dueDay')} type="number" min="1" max="31" placeholder="5" className="mt-1" />
              {errors.dueDay && <p className="text-xs text-rose-500 mt-1">{errors.dueDay.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Category</label>
              <Input {...register('category')} placeholder="e.g. Mobile, Utilities" className="mt-1" />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Auto Reminder</label>
              <select
                {...register('reminderDays')}
                className="w-full mt-1 p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-white"
              >
                <option value="1">1 day before</option>
                <option value="2">2 days before</option>
                <option value="3">3 days before</option>
                <option value="5">5 days before</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-full font-bold text-xs bg-[#18181B] text-white">
              {isSubmitting ? 'Saving...' : 'Set Monthly Reminder'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default Subscriptions;
