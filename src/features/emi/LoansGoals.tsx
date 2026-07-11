import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSnackbar } from 'notistack';
import {
  PiggyBank,
  Percent,
  Plus,
  Calendar,
  AlertCircle,
  Award,
  Trash2,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useEmi } from '@/hooks/useEmi';
import { useSavings } from '@/hooks/useSavings';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import dayjs from 'dayjs';

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

  // Queries
  const { data: emis = [], isLoading: isLoadingEmis, createEmi, payEmi, deleteEmi } = useEmi();
  const { data: savings = [], isLoading: isLoadingSavings, createSavingsGoal, updateSavingsProgress, deleteSavingsGoal } = useSavings();
  const { data: settings } = useSettings();

  const currency = settings?.currency || 'INR';

  // Forms
  const { register: regEmi, handleSubmit: handleEmi, reset: resetEmi, formState: { errors: emiErr } } = useForm<EmiSchema>({ resolver: zodResolver(emiSchema) });
  const { register: regSavings, handleSubmit: handleSavings, reset: resetSavings, formState: { errors: savingsErr } } = useForm<SavingsSchema>({ resolver: zodResolver(savingsSchema) });

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
      enqueueSnackbar('Loan details added', { variant: 'success' });
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
      enqueueSnackbar('Savings goal logged', { variant: 'success' });
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
      await updateSavingsProgress({ id: selectedGoalId, amount: Number(adjustAmount) });
      enqueueSnackbar('Savings progress updated', { variant: 'success' });
      setIsAdjustProgressOpen(false);
    } catch {
      enqueueSnackbar('Failed to update savings', { variant: 'error' });
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
    <div className="space-y-6 text-left">
      <Helmet>
        <title>Loans & Savings Goals | Fintro</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Loans & Savings Goals</h1>
          <p className="text-muted-foreground text-sm font-sans mt-0.5">
            Track principal interest loans, pay monthly EMIs, and monitor savings milestones.
          </p>
        </div>
        <div>
          {activeTab === 'emis' ? (
            <Button variant="primary" onClick={() => setIsEmiOpen(true)} className="gap-1.5 font-sans">
              <Plus className="h-4 w-4" /> Add Loan
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setIsSavingsOpen(true)} className="gap-1.5 font-sans">
              <Plus className="h-4 w-4" /> Add Goal
            </Button>
          )}
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="inline-flex h-11 items-center justify-start rounded-full bg-muted p-1 text-muted-foreground self-start border border-border gap-1">
        <button
          onClick={() => setActiveTab('emis')}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
            activeTab === 'emis'
              ? 'bg-primary text-[#141414] shadow-sm font-semibold'
              : 'hover:bg-card/50 hover:text-foreground'
          }`}
        >
          EMI Loans
        </button>
        <button
          onClick={() => setActiveTab('savings')}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
            activeTab === 'savings'
              ? 'bg-primary text-[#141414] shadow-sm font-semibold'
              : 'hover:bg-card/50 hover:text-foreground'
          }`}
        >
          Savings Goals
        </button>
      </div>

      {/* EMIS LIST */}
      {activeTab === 'emis' && (
        <div className="grid gap-4 md:grid-cols-2">
          {isLoadingEmis ? (
            <div className="col-span-2 py-10 flex justify-center"><LoadingSpinner /></div>
          ) : emis.length === 0 ? (
            <div className="col-span-2">
              <EmptyState
                title="No active loans"
                description="Keep track of your bank interest loans, monthly EMIs, remaining payments, and next due alarm dates."
                actionLabel="Log New Loan"
                onAction={() => setIsEmiOpen(true)}
              />
            </div>
          ) : (
            emis.map((emi: any) => {
              const progressPct = Math.round((emi.monthsPaid / emi.monthsTotal) * 100);
              const isFullyPaid = emi.monthsPaid >= emi.monthsTotal;

              return (
                <Card key={emi._id} className="text-left relative overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{emi.loanName}</CardTitle>
                      <Badge variant="outline" className={isFullyPaid ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}>
                        {isFullyPaid ? 'Completed' : `Due: ${emi.dueDate}`}
                      </Badge>
                    </div>
                    <CardDescription className="font-sans">
                      Principal: {currency} {emi.principal.toLocaleString()} @ {emi.interestRate}% Interest
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm font-sans">
                      <div>
                        <span className="text-muted-foreground block text-xs">Monthly EMI</span>
                        <span className="font-bold text-foreground">{currency} {emi.monthlyEmi.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Remaining Balance</span>
                        <span className="font-bold text-foreground">{currency} {emi.remainingBalance.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Paid Months</span>
                        <span className="font-semibold text-foreground">{emi.monthsPaid} / {emi.monthsTotal} Months</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Start Date</span>
                        <span className="font-semibold text-foreground">{emi.startDate}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-sans font-semibold text-muted-foreground">
                        <span>Paid Balance</span>
                        <span>{progressPct}% Paid</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between items-center border-t pt-3 mt-4">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteEmi(emi._id)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {!isFullyPaid && (
                        <Button variant="outline" size="sm" onClick={() => handlePayEmi(emi._id)} className="font-sans text-xs">
                          Log Next EMI Payment
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* SAVINGS GOALS */}
      {activeTab === 'savings' && (
        <div className="grid gap-4 md:grid-cols-2">
          {isLoadingSavings ? (
            <div className="col-span-2 py-10 flex justify-center"><LoadingSpinner /></div>
          ) : savings.length === 0 ? (
            <div className="col-span-2">
              <EmptyState
                title="No savings goals"
                description="Define long term target goals (e.g. down payment, travel, emergency cash reserves) and track progress."
                actionLabel="Create Savings Goal"
                onAction={() => setIsSavingsOpen(true)}
              />
            </div>
          ) : (
            savings.map((goal: any) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const isGoalMet = goal.currentAmount >= goal.targetAmount;

              return (
                <Card key={goal._id} className="text-left relative overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <Badge variant="outline" className="capitalize text-xs font-semibold bg-muted">
                        {goal.interval}
                      </Badge>
                    </div>
                    <CardDescription className="font-sans">
                      Milestone Target: {goal.targetDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-xs text-muted-foreground block font-sans">Current Saved</span>
                        <span className="text-lg font-bold font-sans text-foreground">
                          {currency} {goal.currentAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block font-sans">Target Amount</span>
                        <span className="text-base font-semibold font-sans text-muted-foreground">
                          {currency} {goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-sans font-semibold text-muted-foreground">
                        <span>Savings Level</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t pt-3 mt-4">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteGoal(goal._id)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => triggerAdjustProgress(goal._id)} className="font-sans text-xs">
                          Add Funds
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* EMI DIALOG */}
      <Dialog isOpen={isEmiOpen} onClose={() => setIsEmiOpen(false)} title="Log New EMI Loan">
        <form onSubmit={handleEmi(onSubmitEmi)} className="space-y-4 text-left">
          <Input label="Loan Name" placeholder="e.g. Home Loan, Car Loan, iPad EMI" error={emiErr.loanName?.message} {...regEmi('loanName')} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Principal Amount" placeholder="0.00" error={emiErr.principal?.message} {...regEmi('principal')} />
            <Input label="Interest Rate (%)" placeholder="e.g. 8.5" error={emiErr.interestRate?.message} {...regEmi('interestRate')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Monthly EMI Amount" placeholder="0.00" error={emiErr.monthlyEmi?.message} {...regEmi('monthlyEmi')} />
            <Input label="Total Months Schedule" placeholder="e.g. 12, 24, 60" error={emiErr.monthsTotal?.message} {...regEmi('monthsTotal')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" error={emiErr.startDate?.message} {...regEmi('startDate')} />
            <Input label="First Due Date" type="date" error={emiErr.dueDate?.message} {...regEmi('dueDate')} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit">Create Loan</Button>
          </div>
        </form>
      </Dialog>

      {/* SAVINGS DIALOG */}
      <Dialog isOpen={isSavingsOpen} onClose={() => setIsSavingsOpen(false)} title="Add Savings Goal">
        <form onSubmit={handleSavings(onSubmitSavings)} className="space-y-4 text-left">
          <Input label="Goal Title" placeholder="e.g. Emergency Funds, New Laptop, Holiday" error={savingsErr.title?.message} {...regSavings('title')} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Target Amount" placeholder="0.00" error={savingsErr.targetAmount?.message} {...regSavings('targetAmount')} />
            <Input label="Current Saved (Optional)" placeholder="0.00" {...regSavings('currentAmount')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Target Date" type="date" error={savingsErr.targetDate?.message} {...regSavings('targetDate')} />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium leading-none">Goal Schedule</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none" {...regSavings('interval')}>
                <option value="monthly">Monthly Goal</option>
                <option value="quarterly">Quarterly Goal</option>
                <option value="yearly">Yearly Goal</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit">Log Goal</Button>
          </div>
        </form>
      </Dialog>

      {/* ADJUST FUNDS DIALOG */}
      <Dialog isOpen={isAdjustProgressOpen} onClose={() => setIsAdjustProgressOpen(false)} title="Add Savings Funds">
        <div className="space-y-4 text-left">
          <Input
            label="Amount to Add"
            placeholder="Enter value"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button onClick={handleSaveProgress}>Confirm Deposit</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
export default LoansGoals;
