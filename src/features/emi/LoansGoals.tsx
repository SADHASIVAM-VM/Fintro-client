import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSnackbar } from 'notistack';
import {
  PiggyBank,
  Plus,
  Trash2,
  CheckCircle2,
  Landmark,
  Target,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useEmi } from '@/hooks/useEmi';
import { useSavings } from '@/hooks/useSavings';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Helmet } from 'react-helmet-async';

// Schemas
const emiSchema = z.object({
  loanName: z.string().min(2, 'Loan name must be at least 2 characters'),
  principal: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be positive'),
  interestRate: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Must be positive'),
  monthlyEmi: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be positive'),
  monthsTotal: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  startDate: z.string().min(1, 'Start date is required'),
});

const savingsSchema = z.object({
  title: z.string().min(2, 'Goal name must be at least 2 characters'),
  targetAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be positive'),
  currentAmount: z.string().optional(),
  targetDate: z.string().min(1, 'Target date is required'),
  interval: z.enum(['monthly', 'quarterly', 'yearly']),
});

type EmiSchema = z.infer<typeof emiSchema>;
type SavingsSchema = z.infer<typeof savingsSchema>;

export const LoansGoals: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Active view Tab
  const [activeTab, setActiveTab] = useState<'emis' | 'savings'>('emis');

  // Modals
  const [isEmiOpen, setIsEmiOpen] = useState(false);
  const [isSavingsOpen, setIsSavingsOpen] = useState(false);
  const [isAdjustProgressOpen, setIsAdjustProgressOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  // Queries
  const { data: emis = [], isLoading: isLoadingEmis, createEmi, payEmi, deleteEmi } = useEmi();
  const { data: savings = [], isLoading: isLoadingSavings, createSavingsGoal, updateSavingsProgress, deleteSavingsGoal } = useSavings();
  const { data: settings } = useSettings();

  const currency = settings?.data?.currency === 'USD' || settings?.currency === 'USD' ? '$' : '₹';

  // Forms
  const { register: regEmi, handleSubmit: handleEmi, reset: resetEmi, formState: { errors: emiErr, isSubmitting: isSubmittingEmi } } = useForm<EmiSchema>({ resolver: zodResolver(emiSchema) });
  const { register: regSavings, handleSubmit: handleSavings, reset: resetSavings, formState: { errors: savingsErr, isSubmitting: isSubmittingSavings } } = useForm<SavingsSchema>({ resolver: zodResolver(savingsSchema) });

  const onSubmitEmi = async (data: EmiSchema) => {
    try {
      await createEmi({
        loanName: data.loanName,
        principal: Number(data.principal),
        interestRate: Number(data.interestRate),
        monthlyEmi: Number(data.monthlyEmi),
        monthsTotal: Number(data.monthsTotal),
        dueDate: data.dueDate,
        startDate: data.startDate,
      });
      enqueueSnackbar('Loan details added successfully', { variant: 'success' });
      setIsEmiOpen(false);
      resetEmi();
    } catch {
      enqueueSnackbar('Failed to create EMI', { variant: 'error' });
    }
  };

  const onSubmitSavings = async (data: SavingsSchema) => {
    try {
      await createSavingsGoal({
        title: data.title,
        targetAmount: Number(data.targetAmount),
        currentAmount: data.currentAmount ? Number(data.currentAmount) : 0,
        targetDate: data.targetDate,
        interval: data.interval,
      });
      enqueueSnackbar('Savings goal logged successfully', { variant: 'success' });
      setIsSavingsOpen(false);
      resetSavings();
    } catch {
      enqueueSnackbar('Failed to create savings goal', { variant: 'error' });
    }
  };

  const handlePayEmi = async (id: string) => {
    try {
      await payEmi(id);
      enqueueSnackbar('EMI payment logged successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to record EMI payment', { variant: 'error' });
    }
  };

  const handleDeleteEmi = async (id: string) => {
    if (!confirm('Are you sure you want to delete this loan record?')) return;
    try {
      await deleteEmi(id);
      enqueueSnackbar('Loan record deleted', { variant: 'info' });
    } catch {
      enqueueSnackbar('Failed to delete loan record', { variant: 'error' });
    }
  };

  const triggerAdjustProgress = (goalId: string) => {
    setSelectedGoalId(goalId);
    setAdjustAmount('');
    setIsAdjustProgressOpen(true);
  };

  const handleSaveProgress = async () => {
    if (!selectedGoalId || isNaN(Number(adjustAmount))) return;
    try {
      setIsSavingProgress(true);
      await updateSavingsProgress({ id: selectedGoalId, amount: Number(adjustAmount) });
      enqueueSnackbar('Savings progress updated', { variant: 'success' });
      setIsAdjustProgressOpen(false);
    } catch {
      enqueueSnackbar('Failed to update savings', { variant: 'error' });
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      await deleteSavingsGoal(id);
      enqueueSnackbar('Goal deleted', { variant: 'info' });
    } catch {
      enqueueSnackbar('Failed to delete goal', { variant: 'error' });
    }
  };

  return (
    <div className="space-y-6 text-left font-sans pb-16 max-w-xl mx-auto animate-fade-in">
      <Helmet>
        <title>Loans & Savings Goals — Fintro</title>
      </Helmet>

      {/* Header Banner */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">Loans & Savings</h1>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">
            Monitor bank EMIs, loans, and target savings goals
          </p>
        </div>

        {/* Compact Responsive Buttons: Icon-Only on Mobile (`< sm`), Icon + Text on Desktop (`sm:`) */}
        {activeTab === 'emis' ? (
          <button
            onClick={() => setIsEmiOpen(true)}
            className="inline-flex items-center gap-1.5 p-2.5 sm:px-4 sm:py-2 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-xs font-extrabold transition-all shadow-md cursor-pointer shrink-0"
            title="Add Loan"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Add Loan</span>
          </button>
        ) : (
          <button
            onClick={() => setIsSavingsOpen(true)}
            className="inline-flex items-center gap-1.5 p-2.5 sm:px-4 sm:py-2 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-xs font-extrabold transition-all shadow-md cursor-pointer shrink-0"
            title="Add Goal"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Add Goal</span>
          </button>
        )}
      </div>

      {/* Segmented Control Sub-Tabs */}
      <SegmentedControl
        options={[
          { id: 'emis', label: 'EMI Loans' },
          { id: 'savings', label: 'Savings Goals' },
        ]}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* EMIS LIST */}
      {activeTab === 'emis' && (
        <div className="space-y-4">
          {isLoadingEmis ? (
            <div className="py-12 flex justify-center"><LoadingSpinner /></div>
          ) : emis.length === 0 ? (
            <EmptyState
              title="No active loans"
              description="Keep track of your monthly EMIs, interest rates, and remaining balance."
              actionLabel="Log New Loan"
              onAction={() => setIsEmiOpen(true)}
              className="py-12"
            />
          ) : (
            emis.map((emi: any) => {
              const progressPct = Math.round((emi.monthsPaid / emi.monthsTotal) * 100);
              const isFullyPaid = emi.monthsPaid >= emi.monthsTotal;

              return (
                <div
                  key={emi._id}
                  className="relative w-full rounded-3xl bg-white dark:bg-zinc-900 p-5 shadow-sm border border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-transparent space-y-4 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white leading-tight">{emi.loanName}</h3>
                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {emi.interestRate}% Rate · Start: {emi.startDate}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isFullyPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'}`}>
                      {isFullyPaid ? 'Completed' : `Due: ${emi.dueDate}`}
                    </span>
                  </div>

                  {/* Financial Metrics Row */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Monthly EMI</span>
                      <span className="text-base font-black text-zinc-900 dark:text-white mt-0.5 block truncate">
                        {currency}{emi.monthlyEmi.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Remaining Balance</span>
                      <span className="text-base font-black text-zinc-900 dark:text-white mt-0.5 block truncate">
                        {currency}{emi.remainingBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      <span>Schedule: {emi.monthsPaid} / {emi.monthsTotal} Months</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{progressPct}% Paid</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleDeleteEmi(emi._id)}
                      className="text-zinc-400 hover:text-rose-500 p-1.5 cursor-pointer transition-colors"
                      title="Delete Loan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {!isFullyPaid && (
                      <button
                        type="button"
                        onClick={() => handlePayEmi(emi._id)}
                        className="px-4 py-2 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-xs font-extrabold transition-all cursor-pointer shadow-sm"
                      >
                        Log Next EMI Payment
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SAVINGS GOALS */}
      {activeTab === 'savings' && (
        <div className="space-y-4">
          {isLoadingSavings ? (
            <div className="py-12 flex justify-center"><LoadingSpinner /></div>
          ) : savings.length === 0 ? (
            <EmptyState
              title="No savings goals"
              description="Define long term target goals and track progress."
              actionLabel="Create Savings Goal"
              onAction={() => setIsSavingsOpen(true)}
              className="py-12"
            />
          ) : (
            savings.map((goal: any) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

              return (
                <div
                  key={goal._id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-transparent space-y-4 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white leading-tight">{goal.title}</h3>
                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">Target Date: {goal.targetDate}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 capitalize">
                      {goal.interval}
                    </span>
                  </div>

                  <div className="flex justify-between items-end pt-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Current Saved</span>
                      <span className="text-xl font-black text-zinc-900 dark:text-white mt-0.5 block truncate">
                        {currency}{goal.currentAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Target Milestone</span>
                      <span className="text-sm font-extrabold text-zinc-500 dark:text-zinc-400 mt-0.5 block truncate">
                        {currency}{goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      <span>Savings Level</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{pct}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="text-zinc-400 hover:text-rose-500 p-1.5 cursor-pointer transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerAdjustProgress(goal._id)}
                      className="px-4 py-2 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-xs font-extrabold transition-all cursor-pointer shadow-sm"
                    >
                      Add Funds
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* EMI DIALOG */}
      <Dialog isOpen={isEmiOpen} onClose={() => setIsEmiOpen(false)} title="Log New EMI Loan">
        <form onSubmit={handleEmi(onSubmitEmi)} className="space-y-4 text-left font-sans pt-1">
          <Input label="Loan Name" placeholder="e.g. Home Loan, Car Loan, iPad EMI" error={emiErr.loanName?.message} {...regEmi('loanName')} />

          <div className="grid grid-cols-2 gap-4">
            <Input label={`Principal (${currency})`} placeholder="0.00" error={emiErr.principal?.message} {...regEmi('principal')} />
            <Input label="Interest Rate (%)" placeholder="e.g. 8.5" error={emiErr.interestRate?.message} {...regEmi('interestRate')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={`Monthly EMI (${currency})`} placeholder="0.00" error={emiErr.monthlyEmi?.message} {...regEmi('monthlyEmi')} />
            <Input label="Total Months Schedule" placeholder="e.g. 12, 24, 60" error={emiErr.monthsTotal?.message} {...regEmi('monthsTotal')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" error={emiErr.startDate?.message} {...regEmi('startDate')} />
            <Input label="First Due Date" type="date" error={emiErr.dueDate?.message} {...regEmi('dueDate')} />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsEmiOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingEmi} className="rounded-full font-bold text-xs bg-[#18181B] text-white">
              {isSubmittingEmi ? 'Creating...' : 'Create Loan'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* SAVINGS DIALOG */}
      <Dialog isOpen={isSavingsOpen} onClose={() => setIsSavingsOpen(false)} title="Add Savings Goal">
        <form onSubmit={handleSavings(onSubmitSavings)} className="space-y-4 text-left font-sans pt-1">
          <Input label="Goal Title" placeholder="e.g. Emergency Funds, Holiday Trip" error={savingsErr.title?.message} {...regSavings('title')} />

          <div className="grid grid-cols-2 gap-4">
            <Input label={`Target Amount (${currency})`} placeholder="0.00" error={savingsErr.targetAmount?.message} {...regSavings('targetAmount')} />
            <Input label={`Current Saved (${currency})`} placeholder="0.00" {...regSavings('currentAmount')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Target Date" type="date" error={savingsErr.targetDate?.message} {...regSavings('targetDate')} />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">Goal Schedule</label>
              <select className="flex h-11 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none" {...regSavings('interval')}>
                <option value="monthly">Monthly Goal</option>
                <option value="quarterly">Quarterly Goal</option>
                <option value="yearly">Yearly Goal</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsSavingsOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingSavings} className="rounded-full font-bold text-xs bg-[#18181B] text-white">
              {isSubmittingSavings ? 'Logging...' : 'Log Goal'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ADJUST FUNDS DIALOG */}
      <Dialog isOpen={isAdjustProgressOpen} onClose={() => setIsAdjustProgressOpen(false)} title="Add Savings Funds">
        <div className="space-y-4 text-left font-sans pt-1">
          <Input
            label={`Amount to Deposit (${currency})`}
            placeholder="Enter value"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(e.target.value)}
          />
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsAdjustProgressOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button onClick={handleSaveProgress} disabled={isSavingProgress} className="rounded-full font-bold text-xs bg-[#18181B] text-white">
              {isSavingProgress ? 'Confirming...' : 'Confirm Deposit'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default LoansGoals;
