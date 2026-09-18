import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSnackbar } from 'notistack';
import { useDropzone } from 'react-dropzone';
import {
  Plus,
  Users,
  Search,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  ChevronRight,
  ArrowLeftRight,
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft,
  HandCoins,
} from 'lucide-react';
import { useBorrow } from '@/hooks/useBorrow';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import dayjs from 'dayjs';
import { BillViewer } from '@/components/ui/BillViewer';
import { getFileUrl } from '@/lib/utils';

// Schemas
const accountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const transactionSchema = z.object({
  accountId: z.string().min(1, 'Please select an account'),
  type: z.enum(['borrowed', 'lent', 'paid_borrow', 'paid_lent']),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be positive',
  }),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  parentTransaction: z.string().optional(),
});

type AccountSchema = z.infer<typeof accountSchema>;
type TransactionSchema = z.infer<typeof transactionSchema>;

export const Ledger: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  // States
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeAccount, setActiveAccount] = useState<any | null>(null);
  const [prefilledParentTxId, setPrefilledParentTxId] = useState<string | null>(null);

  // Viewer Modal State
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | undefined>(undefined);
  const [viewerTitle, setViewerTitle] = useState<string | undefined>(undefined);

  // Queries
  const { accounts, isLoadingAccounts, history, isLoadingHistory, createAccount, addTransaction } = useBorrow(activeAccount?.account._id);
  const { data: settings } = useSettings();

  const currency = settings?.currency === 'USD' ? '$' : '₹';

  // Forms
  const {
    register: regAccount,
    handleSubmit: handleAccountSubmit,
    reset: resetAccount,
    formState: { errors: accErrors, isSubmitting: isSubmittingAccount },
  } = useForm<AccountSchema>({ resolver: zodResolver(accountSchema) });

  const {
    register: regTx,
    handleSubmit: handleTxSubmit,
    setValue: setTxValue,
    reset: resetTx,
    watch: watchTx,
    formState: { errors: txErrors, isSubmitting: isSubmittingTx },
  } = useForm<TransactionSchema>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: dayjs().format('YYYY-MM-DD'),
      parentTransaction: '',
    },
  });

  const selectedAccountId = watchTx('accountId');
  const selectedTxType = watchTx('type');

  // Dropzone
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      enqueueSnackbar('Transaction receipt attached', { variant: 'success' });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const onSubmitAccount = async (data: AccountSchema) => {
    try {
      await createAccount(data);
      enqueueSnackbar('Ledger contact added successfully', { variant: 'success' });
      setIsAddAccountOpen(false);
      resetAccount();
    } catch {
      enqueueSnackbar('Failed to create contact', { variant: 'error' });
    }
  };

  const onSubmitTx = async (data: TransactionSchema) => {
    try {
      const fd = new FormData();
      fd.append('accountId', data.accountId);
      fd.append('type', data.type);
      fd.append('amount', data.amount);
      fd.append('date', data.date);
      if (data.notes) fd.append('notes', data.notes);
      if (data.parentTransaction) fd.append('parentTransaction', data.parentTransaction);
      if (selectedFile) fd.append('receipt', selectedFile);

      await addTransaction(fd);
      enqueueSnackbar('Ledger entry logged successfully', { variant: 'success' });
      setIsAddTxOpen(false);
      resetTx();
      setSelectedFile(null);
      setPrefilledParentTxId(null);
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to add entry', { variant: 'error' });
    }
  };

  const triggerRepayment = (principalTx: any) => {
    const isBorrowType = principalTx.type === 'borrowed';

    resetTx({
      accountId: principalTx.account,
      type: isBorrowType ? 'paid_borrow' : 'paid_lent',
      amount: String(principalTx.remaining),
      date: dayjs().format('YYYY-MM-DD'),
      parentTransaction: principalTx._id,
      notes: '',
    });
    setPrefilledParentTxId(principalTx._id);
    setIsAddTxOpen(true);
  };

  // Preprocess history to group repayments under principal transaction
  const processedHistory = React.useMemo(() => {
    if (!history || history.length === 0) return { principals: [], generalRepayments: [] };

    const sortedTxs = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const principalsMap = new Map<string, { tx: any; repayments: any[]; remaining: number }>();
    const generalRepayments: any[] = [];

    sortedTxs.forEach((tx) => {
      if (tx.type === 'borrowed' || tx.type === 'lent') {
        principalsMap.set(tx._id, {
          tx,
          repayments: [],
          remaining: tx.amount,
        });
      }
    });

    sortedTxs.forEach((tx) => {
      if (tx.type === 'paid_borrow' || tx.type === 'paid_lent') {
        if (tx.parentTransaction) {
          const parentId = typeof tx.parentTransaction === 'object' ? tx.parentTransaction._id : tx.parentTransaction;
          const parent = principalsMap.get(parentId);
          if (parent) {
            parent.repayments.push(tx);
            parent.remaining = Math.max(0, parent.remaining - tx.amount);
            return;
          }
        }

        const matchingType = tx.type === 'paid_borrow' ? 'borrowed' : 'lent';
        let attributed = false;
        for (const [_, parent] of principalsMap.entries()) {
          if (parent.tx.type === matchingType && parent.remaining > 0) {
            parent.repayments.push(tx);
            parent.remaining = Math.max(0, parent.remaining - tx.amount);
            attributed = true;
            break;
          }
        }
        if (!attributed) {
          generalRepayments.push(tx);
        }
      }
    });

    const principalsList = Array.from(principalsMap.values()).map((p) => ({
      ...p.tx,
      repayments: p.repayments.reverse(),
      remaining: p.remaining,
    })).reverse();

    return { principals: principalsList, generalRepayments };
  }, [history]);

  const totalPendingLent = accounts.reduce((sum: number, a: any) => sum + (a.balanceType === 'lent' ? a.remaining : 0), 0);
  const totalPendingBorrowed = accounts.reduce((sum: number, a: any) => sum + (a.balanceType === 'borrowed' ? a.remaining : 0), 0);
  const totalPendingAmount = Math.abs(totalPendingLent - totalPendingBorrowed);
  const pendingType = totalPendingLent >= totalPendingBorrowed ? 'owed_to_you' : 'you_owe';

  return (
    <div className="space-y-6 text-left font-sans pb-16 max-w-xl mx-auto animate-fade-in">
      <Helmet>
        <title>Loans & Ledger — Fintro</title>
      </Helmet>

      {/* Header Banner */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">Loans & Ledger</h1>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">
            Track borrowed or lent money and settlements
          </p>
        </div>

        {/* Compact Responsive Buttons: Icon-Only on Mobile (`< sm`), Icon + Text on Desktop (`sm:`) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="inline-flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-100 transition-all shadow-xs cursor-pointer"
            title="Add Contact"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Add Contact</span>
          </button>

          <button
            onClick={() => {
              setPrefilledParentTxId(null);
              resetTx({
                accountId: activeAccount?.account._id || '',
                type: 'borrowed',
                amount: '',
                date: dayjs().format('YYYY-MM-DD'),
                parentTransaction: '',
                notes: '',
              });
              setIsAddTxOpen(true);
            }}
            className="inline-flex items-center gap-1.5 p-2.5 sm:px-4 sm:py-2 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-xs font-extrabold transition-all shadow-md cursor-pointer"
            title="Log Entry"
          >
            <ArrowLeftRight className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Log Entry</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center">
        <div className="border-r border-zinc-100 dark:border-zinc-800 pr-2">
          <span className="text-[10px] uppercase font-bold text-rose-500 block tracking-wider">You Owe</span>
          <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">
            {currency}{totalPendingBorrowed.toLocaleString()}
          </span>
        </div>
        <div className="border-r border-zinc-100 dark:border-zinc-800 px-2">
          <span className="text-[10px] uppercase font-bold text-emerald-500 block tracking-wider">Owed to You</span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {currency}{totalPendingLent.toLocaleString()}
          </span>
        </div>
        <div className="pl-2">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Contacts</span>
          <span className="text-base font-extrabold text-zinc-900 dark:text-white mt-1 block">
            {accounts.length} Total
          </span>
        </div>
      </div>

      {/* Contacts List Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span>Ledger Contacts</span>
          <span className="text-xs font-semibold text-zinc-400">Select to view</span>
        </h3>

        {isLoadingAccounts ? (
          <div className="py-8 flex justify-center"><LoadingSpinner /></div>
        ) : accounts.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 font-medium">
            No contacts added yet. Click "Add Contact" above to start.
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {accounts.map((item: any) => {
              const isSelected = activeAccount?.account._id === item.account._id;

              return (
                <button
                  key={item.account._id}
                  type="button"
                  onClick={() => setActiveAccount(item)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-left shrink-0 transition-all cursor-pointer ${isSelected
                      ? 'bg-[#18181B] text-white dark:bg-white dark:text-zinc-900 shadow-md border-transparent'
                      : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-white/20 text-white dark:bg-zinc-900 dark:text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'}`}>
                    {item.account.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-none">{item.account.name}</span>
                    <span className={`text-[10px] font-semibold mt-1 block opacity-80`}>
                      {item.remaining > 0 ? `${currency}${item.remaining.toLocaleString()}` : 'Settled'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Contact Details Card */}
      {activeAccount ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">{activeAccount.account.name}</h3>
              <p className="text-xs text-zinc-400 font-medium">
                {activeAccount.balanceType === 'borrowed' ? 'You owe this contact' : 'This contact owes you'}
              </p>
            </div>
            <span className={`text-lg font-black ${activeAccount.balanceType === 'borrowed' ? 'text-rose-500' : 'text-emerald-500'}`}>
              {currency}{activeAccount.remaining.toLocaleString()}
            </span>
          </div>

          {/* Actioned Money Dues List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Transaction History</h4>

            {isLoadingHistory ? (
              <div className="py-8 flex justify-center"><LoadingSpinner /></div>
            ) : processedHistory.principals.length === 0 ? (
              <p className="py-6 text-center text-xs text-zinc-400 font-medium">No transactions recorded for this contact.</p>
            ) : (
              <div className="space-y-3">
                {processedHistory.principals.map((p: any) => {
                  const isLent = p.type === 'lent';
                  const isSettled = p.remaining === 0;

                  return (
                    <div key={p._id} className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${isLent ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'}`}>
                            {p.type}
                          </span>
                          <span className="text-xs font-medium text-zinc-400">{p.date}</span>
                        </div>
                        <span className={`text-sm font-extrabold ${isLent ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                          {currency}{p.amount.toLocaleString()}
                        </span>
                      </div>

                      {p.notes && <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">{p.notes}</p>}

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          {isSettled ? '✓ Fully Settled' : `Pending: ${currency}${p.remaining.toLocaleString()}`}
                        </span>

                        {!isSettled && (
                          <button
                            type="button"
                            onClick={() => triggerRepayment(p)}
                            className="px-3 py-1.5 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-xs font-extrabold transition-all cursor-pointer"
                          >
                            Log Payback
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 text-center space-y-2">
          <HandCoins className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="text-xs font-bold text-zinc-500">Select a contact above to view detailed loan & payback history</p>
        </div>
      )}

      {/* Add Account Dialog */}
      <Dialog isOpen={isAddAccountOpen} onClose={() => setIsAddAccountOpen(false)} title="Add Ledger Contact">
        <form onSubmit={handleAccountSubmit(onSubmitAccount)} className="space-y-4 text-left font-sans pt-1">
          <Input
            label="Contact Name"
            placeholder="Person or Institution name"
            error={accErrors.name?.message}
            {...regAccount('name')}
          />
          <Input
            label="Phone Number (Optional)"
            placeholder="e.g. +91 9876543210"
            {...regAccount('phone')}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsAddAccountOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingAccount} className="rounded-full font-bold bg-[#18181B] text-white">
              {isSubmittingAccount ? 'Creating...' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} title="Log Ledger Entry">
        <form onSubmit={handleTxSubmit(onSubmitTx)} className="space-y-4 text-left font-sans pt-1">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">Select Contact</label>
            <select
              className="flex h-11 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none"
              {...regTx('accountId')}
              onChange={(e) => setTxValue('accountId', e.target.value)}
            >
              <option value="">Select Contact...</option>
              {accounts.map((a: any) => (
                <option key={a.account._id} value={a.account._id}>
                  {a.account.name}
                </option>
              ))}
            </select>
            {txErrors.accountId && <p className="text-xs text-rose-500 font-medium">{txErrors.accountId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">Entry Type</label>
              <select
                className="flex h-11 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none"
                {...regTx('type')}
              >
                <option value="borrowed">Borrowed (You receive cash)</option>
                <option value="lent">Lent (You give cash)</option>
                <option value="paid_borrow">Payback to them (You pay)</option>
                <option value="paid_lent">Payback from them (They pay)</option>
              </select>
            </div>
            <Input
              label={`Amount (${currency})`}
              placeholder="0.00"
              error={txErrors.amount?.message}
              {...regTx('amount')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              error={txErrors.date?.message}
              {...regTx('date')}
            />
            <Input
              label="Notes (Optional)"
              placeholder="e.g. cash settlement"
              {...regTx('notes')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsAddTxOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingTx} className="rounded-full font-bold bg-[#18181B] text-white">
              {isSubmittingTx ? 'Logging...' : 'Log Entry'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default Ledger;
