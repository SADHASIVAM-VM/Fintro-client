import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSnackbar } from 'notistack';
import {
  Wallet,
  Plus,
  Building2,
  CreditCard as CreditCardIcon,
  Banknote,
  Smartphone,
  CheckCircle2,
  Trash2,
  Edit2,
  Wifi,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Helmet } from 'react-helmet-async';

const accountSchema = z.object({
  name: z.string().min(2, 'Account name must be at least 2 characters'),
  type: z.enum(['bank_account', 'cash', 'credit_card', 'debit_card', 'upi_wallet', 'e_wallet', 'other']),
  institution: z.string().optional(),
  accountIdentifier: z.string().optional(),
  openingBalance: z.string().refine((val) => !isNaN(Number(val)), {
    message: 'Opening balance must be a number',
  }),
});

type AccountFormSchema = z.infer<typeof accountSchema>;

export const Accounts: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { accounts, totalBalance, isLoading, createAccount, updateAccount, deleteAccount } = useAccounts();
  const { data: settings } = useSettings();

  const [activeFilter, setActiveFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);

  const currency = settings?.currency === 'USD' ? '$' : '₹';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormSchema>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'bank_account',
      institution: '',
      accountIdentifier: '',
      openingBalance: '0',
    },
  });

  const onSubmit = async (data: AccountFormSchema) => {
    try {
      if (editingAccount) {
        await updateAccount({
          id: editingAccount._id,
          data: {
            name: data.name,
            type: data.type as any,
            institution: data.institution,
            accountIdentifier: data.accountIdentifier,
            currentBalance: Number(data.openingBalance),
          },
        });
        enqueueSnackbar('Account updated successfully!', { variant: 'success' });
      } else {
        await createAccount({
          name: data.name,
          type: data.type as any,
          institution: data.institution,
          accountIdentifier: data.accountIdentifier,
          openingBalance: Number(data.openingBalance),
        });
        enqueueSnackbar('Account created successfully!', { variant: 'success' });
      }
      setIsAddOpen(false);
      setEditingAccount(null);
      reset();
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Operation failed', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this account?')) return;
    try {
      await deleteAccount(id);
      enqueueSnackbar('Account archived successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to archive account', { variant: 'error' });
    }
  };

  // Helper for dynamic card background gradient based on type
  const getCardStyle = (type: string, index: number) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return {
          bg: 'bg-[#18181B] text-white border-zinc-800',
          badgeBg: 'bg-zinc-800 text-zinc-300',
          brandLogo: 'VISA',
          glow: 'from-zinc-700/20 to-transparent',
        };
      case 'bank_account':
        return {
          bg: index % 2 === 0 ? 'bg-[#0F172A] text-white border-slate-800' : 'bg-[#1E1B4B] text-white border-indigo-900',
          badgeBg: 'bg-slate-800 text-slate-300',
          brandLogo: 'BANK',
          glow: 'from-blue-600/20 to-transparent',
        };
      case 'cash':
        return {
          bg: 'bg-gradient-to-br from-emerald-900 to-zinc-900 text-white border-emerald-800/80',
          badgeBg: 'bg-emerald-950 text-emerald-300',
          brandLogo: 'CASH',
          glow: 'from-emerald-500/20 to-transparent',
        };
      case 'upi_wallet':
      case 'e_wallet':
        return {
          bg: 'bg-gradient-to-br from-purple-950 via-zinc-900 to-zinc-950 text-white border-purple-900/80',
          badgeBg: 'bg-purple-950 text-purple-300',
          brandLogo: 'UPI',
          glow: 'from-purple-500/20 to-transparent',
        };
      default:
        return {
          bg: 'bg-[#18181B] text-white border-zinc-800',
          badgeBg: 'bg-zinc-800 text-zinc-300',
          brandLogo: 'FIN',
          glow: 'from-zinc-700/20 to-transparent',
        };
    };
  };

  // Filter accounts
  const filteredAccounts = accounts.filter((acc: any) => {
    if (activeFilter === 'cards') return acc.type === 'credit_card' || acc.type === 'debit_card';
    if (activeFilter === 'banks') return acc.type === 'bank_account';
    if (activeFilter === 'wallets') return acc.type === 'cash' || acc.type === 'upi_wallet' || acc.type === 'e_wallet';
    return true;
  });

  return (
    <div className="space-y-6 text-left font-sans pb-16 max-w-xl mx-auto animate-fade-in">
      <Helmet>
        <title>Cards & Accounts — Fintro</title>
      </Helmet>

      {/* Header Banner */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">Cards & Accounts</h1>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">
            Manage your digital cards, wallets, and balances
          </p>
        </div>

        {/* Compact Button: Only Icon on Mobile (`< sm`), Icon + Text on Desktop (`sm:`) */}
        <button
          onClick={() => {
            setEditingAccount(null);
            reset({ name: '', type: 'bank_account', institution: '', accountIdentifier: '', openingBalance: '0' });
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-1.5 p-2.5 sm:px-4 sm:py-2 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-xs font-extrabold transition-all shadow-md cursor-pointer"
          title="Add New Account"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Add Account</span>
        </button>
      </div>

      {/* Total Available Balance Banner Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Total Net Balance</span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mt-1">
            {currency}{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-zinc-900 dark:text-white block">{accounts.length} Active Accounts</span>
          <span className="text-[10px] text-zinc-400 font-semibold block mt-0.5">Unified Liquidity</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <SegmentedControl
        options={[
          { id: 'all', label: 'All Accounts' },
          { id: 'cards', label: 'Cards' },
          { id: 'banks', label: 'Bank Accounts' },
          { id: 'wallets', label: 'Wallets & Cash' },
        ]}
        activeId={activeFilter}
        onChange={setActiveFilter}
      />

      {/* Fintro Digital Cards Grid */}
      {isLoading ? (
        <div className="py-16 flex justify-center"><LoadingSpinner size="lg" /></div>
      ) : filteredAccounts.length === 0 ? (
        <EmptyState
          title="No accounts found"
          description="Add your bank account, credit card, or cash wallet."
          actionLabel="Add Account"
          onAction={() => setIsAddOpen(true)}
          className="py-12"
        />
      ) : (
        <div className="space-y-4">
          {filteredAccounts.map((acc: any, index: number) => {
            const style = getCardStyle(acc.type, index);

            return (
              <div
                key={acc._id}
                className={`relative w-full rounded-3xl ${style.bg} p-6 shadow-xl overflow-hidden transition-all duration-300 hover:scale-[1.01] border relative group`}
              >
                {/* Background glow radial gradient */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${style.glow} rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none`} />

                {/* Top Row: Account Name & Brand / Actions */}
                <div className="relative z-10 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold tracking-wide text-white">{acc.name}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${style.badgeBg}`}>
                      {acc.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingAccount(acc);
                        reset({
                          name: acc.name,
                          type: acc.type,
                          institution: acc.institution || '',
                          accountIdentifier: acc.accountIdentifier || '',
                          openingBalance: String(acc.currentBalance),
                        });
                        setIsAddOpen(true);
                      }}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(acc._id)}
                      className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/40 text-rose-300 transition-colors cursor-pointer"
                      title="Archive Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <Wifi className="w-4 h-4 text-zinc-400 rotate-90 ml-1 hidden sm:block" />
                  </div>
                </div>

                {/* Middle Row: Current Balance */}
                <div className="relative z-10 mb-6">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Current Balance</p>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
                    {currency}{(acc.currentBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h3>
                </div>

                {/* Bottom Row: Institution / Masked Number */}
                <div className="relative z-10 flex items-end justify-between font-mono text-xs text-zinc-300">
                  <div className="tracking-widest font-medium text-zinc-300">
                    {acc.accountIdentifier ? `•••• ${acc.accountIdentifier.slice(-4)}` : '•••• •••• •••• 4921'}
                  </div>
                  <div className="text-right font-sans">
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold">
                      {acc.institution || 'Fintro Bank'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Account Dialog Modal */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={editingAccount ? 'Edit Account Details' : 'Add Financial Account / Card'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans pt-1 text-left">
          <div>
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Account / Card Name</label>
            <Input {...register('name')} placeholder="e.g. HDFC Primary Salary, Platinum Visa Card" className="mt-1" />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Account Type</label>
              <select
                {...register('type')}
                className="w-full mt-1 h-11 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="bank_account">Bank Account</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="cash">Cash Wallet</option>
                <option value="upi_wallet">UPI Wallet</option>
                <option value="e_wallet">E-Wallet</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Bank / Institution</label>
              <Input {...register('institution')} placeholder="e.g. HDFC, ICICI, SBI" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Masked ID / Card Number</label>
              <Input {...register('accountIdentifier')} placeholder="e.g. XXXX-4921" className="mt-1" />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {editingAccount ? 'Current Balance (₹)' : 'Opening Balance (₹)'}
              </label>
              <Input {...register('openingBalance')} type="number" step="0.01" placeholder="0.00" className="mt-1" />
              {errors.openingBalance && <p className="text-xs text-rose-500 mt-1">{errors.openingBalance.message}</p>}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-full font-bold bg-[#18181B] text-white">
              {isSubmitting ? 'Saving...' : editingAccount ? 'Update Account' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default Accounts;
