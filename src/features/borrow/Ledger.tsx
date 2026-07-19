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
} from 'lucide-react';
import { useBorrow } from '@/hooks/useBorrow';
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
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false); // Using setIsAddOpen to align with original imports/uses
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

  const currency = settings?.currency || 'INR';

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
      enqueueSnackbar('Borrow ledger contact added', { variant: 'success' });
      setIsAddAccountOpen(false);
      resetAccount();
    } catch {
      enqueueSnackbar('Failed to create account', { variant: 'error' });
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
      enqueueSnackbar('Transaction logged', { variant: 'success' });
      setIsAddTxOpen(false);
      resetTx();
      setSelectedFile(null);
      setPrefilledParentTxId(null);
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to add ledger entry', { variant: 'error' });
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

  const triggerGeneralRepayment = (accountSummary: any) => {
    const acc = accountSummary.account;
    const isBorrowType = accountSummary.balanceType === 'borrowed';

    resetTx({
      accountId: acc._id,
      type: isBorrowType ? 'paid_borrow' : 'paid_lent',
      amount: String(accountSummary.remaining),
      date: dayjs().format('YYYY-MM-DD'),
      parentTransaction: '',
      notes: '',
    });
    setPrefilledParentTxId(null);
    setIsAddTxOpen(true);
  };

  // Preprocess history to group repayments under their respective principal transaction
  const processedHistory = React.useMemo(() => {
    if (!history || history.length === 0) return { principals: [], generalRepayments: [] };

    // Sort by date ascending to process chronologically
    const sortedTxs = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Prepare structures
    const principalsMap = new Map<string, { tx: any; repayments: any[]; remaining: number }>();
    const generalRepayments: any[] = [];

    // Step 1: Identify all principal transactions
    sortedTxs.forEach((tx) => {
      if (tx.type === 'borrowed' || tx.type === 'lent') {
        principalsMap.set(tx._id, {
          tx,
          repayments: [],
          remaining: tx.amount
        });
      }
    });

    // Step 2: Associate repayments
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

        // Fallback: Find oldest principal transaction of matching type with remaining balance > 0
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

    // Convert map back to list, newest principal transactions first
    const principalsList = Array.from(principalsMap.values()).map(p => ({
      ...p.tx,
      repayments: p.repayments.reverse(), // newest repayment first
      remaining: p.remaining,
    })).reverse();

    return { principals: principalsList, generalRepayments };
  }, [history]);

  const totalPendingLent = accounts.reduce((sum: number, a: any) => sum + (a.balanceType === 'lent' ? a.remaining : 0), 0);
  const totalPendingBorrowed = accounts.reduce((sum: number, a: any) => sum + (a.balanceType === 'borrowed' ? a.remaining : 0), 0);
  const totalPendingAmount = Math.abs(totalPendingLent - totalPendingBorrowed);
  const pendingType = totalPendingLent >= totalPendingBorrowed ? 'owed_to_you' : 'you_owe';

  return (
    <div className="space-y-6 text-left">
      <Helmet>
        <title>Ledger (Borrow/Lent) | Fintro</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ledger (Borrow/Lent)</h1>
            {totalPendingAmount > 0 ? (
              <Badge variant="outline" className={`font-sans py-1 px-3 text-xs font-semibold rounded-full border ${pendingType === 'owed_to_you' ? 'bg-green-500/10 text-green-600/90 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                {pendingType === 'owed_to_you' ? 'Net Owed to You: ' : 'Net You Owe: '}
                {currency} {totalPendingAmount.toLocaleString()}
              </Badge>
            ) : (
              <Badge variant="outline" className="font-sans py-1 px-3 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-600 border-slate-500/20">
                All Settled
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm font-sans mt-0.5">
            Manage borrowed or lent money, set due schedules, and track settlement repayments.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddAccountOpen(true)} className="gap-1.5 font-sans">
            <Plus className="h-4.5 w-4.5" /> Add Contact
          </Button>
          <Button
            variant="primary"
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
            className="gap-1.5 font-sans"
          >
            <ArrowLeftRight className="h-4.5 w-4.5" /> Log Transaction
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-sans">Net Borrowed (You Owe)</p>
                <h3 className="text-2xl font-bold font-sans mt-1">
                  {currency} {accounts.reduce((sum: number, a: any) => sum + (a.balanceType === 'borrowed' ? a.remaining : 0), 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-sans">Net Lent (Owed to You)</p>
                <h3 className="text-2xl font-bold font-sans mt-1">
                  {currency} {accounts.reduce((sum: number, a: any) => sum + (a.balanceType === 'lent' ? a.remaining : 0), 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-sans">Active Accounts</p>
                <h3 className="text-2xl font-bold font-sans mt-1">
                  {accounts.filter((a: any) => a.account.status !== 'closed').length} Contacts
                </h3>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Accounts List */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Contacts column */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ledger Contacts</CardTitle>
              <CardDescription className="font-sans">Select a contact to view transaction history.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingAccounts ? (
                <div className="p-10 flex justify-center"><LoadingSpinner /></div>
              ) : accounts.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground font-sans">
                  No accounts found. Click Add Contact to get started.
                </div>
              ) : (
                <div className="divide-y max-h-[400px] overflow-y-auto">
                  {accounts.map((item: any) => (
                    <button
                      key={item.account._id}
                      onClick={() => setActiveAccount(item)}
                      className={`w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left ${activeAccount?.account._id === item.account._id ? 'bg-muted' : ''
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-foreground text-sm">{item.account.name}</span>
                        {item.account.phone && (
                          <span className="text-xs text-muted-foreground font-sans block mt-0.5">{item.account.phone}</span>
                        )}
                        <span className="text-[10px] mt-1 inline-block uppercase font-bold tracking-wider">
                          {item.account.status === 'closed' ? (
                            <Badge variant="outline" className="text-green-600 bg-green-50">Settled</Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 bg-yellow-50">Pending</Badge>
                          )}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details column */}
        <div className="md:col-span-2 space-y-4">
          {activeAccount ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div>
                  <CardTitle className="text-lg">{activeAccount.account.name}</CardTitle>
                  <CardDescription className="font-sans">
                    Ledger Summary & Payback Options
                  </CardDescription>
                </div>
                {activeAccount.account.status !== 'closed' && (
                  <Button variant="primary" size="sm" onClick={() => triggerRepayment(activeAccount)} className="font-sans text-xs">
                    Log Settlement / Repayment
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Visual state summary */}
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
                  <div>
                    <span className="text-xs text-muted-foreground font-sans block">Pending Balance</span>
                    <span className={`text-xl font-bold font-sans ${activeAccount.balanceType === 'borrowed' ? 'text-red-500' : 'text-green-500'}`}>
                      {currency} {activeAccount.remaining.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {activeAccount.balanceType === 'borrowed' ? 'You owe this amount' : 'They owe you this amount'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-sans block">Total Exchanged</span>
                    <span className="text-sm font-semibold block font-sans text-muted-foreground mt-1">
                      Borrowed: <span className="font-bold text-foreground">{currency} {activeAccount.totalBorrowed.toLocaleString()}</span>
                    </span>
                    <span className="text-sm font-semibold block font-sans text-muted-foreground">
                      Lent: <span className="font-bold text-foreground">{currency} {activeAccount.totalLent.toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                {/* Principal Transaction Cards */}
                <div className="space-y-4 text-left">
                  <h4 className="font-bold text-base tracking-tight">Actioned Money Dues</h4>
                  {isLoadingHistory ? (
                    <div className="py-10 flex justify-center"><LoadingSpinner /></div>
                  ) : processedHistory.principals.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground bg-muted/20 border border-dashed rounded-xl font-sans">
                      No borrow or lent principal transactions recorded.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {processedHistory.principals.map((p: any) => {
                        const isLent = p.type === 'lent';
                        const isSettled = p.remaining === 0;

                        return (
                          <Card key={p._id} className="overflow-hidden border border-muted bg-background/50 hover:bg-background/80 transition-colors">
                            <CardContent className="p-4 space-y-3">
                              {/* Header row */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] uppercase font-bold py-0.5 px-2 rounded ${isLent ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                      }`}
                                  >
                                    {p.type}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground font-sans">{p.date}</span>
                                </div>
                                <span className={`font-extrabold text-sm sm:text-base font-sans ${isLent ? 'text-green-600' : 'text-red-500'}`}>
                                  {currency} {p.amount.toLocaleString()}
                                </span>
                              </div>

                              {/* Description and notes */}
                              {p.notes && (
                                <p className="text-sm font-sans text-foreground/80 bg-muted/20 p-2 rounded-lg border border-muted/50">
                                  {p.notes}
                                </p>
                              )}

                              {/* Principal receipt if exists */}
                              {p.receiptImage && p.receiptImage !== 'null' && (
                                <div className="text-left">
                                  <button
                                    onClick={() => {
                                      setViewerUrl(getFileUrl(p.receiptImage));
                                      setViewerTitle(`Principal Receipt`);
                                      setIsViewerOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-[10px] font-sans bg-transparent border-0 cursor-pointer p-0"
                                  >
                                    <ImageIcon className="h-3.5 w-3.5" /> View Principal Receipt
                                  </button>
                                </div>
                              )}

                              {/* Repayment and Pending state */}
                              <div className="flex items-center justify-between border-t border-muted/60 pt-3">
                                <div>
                                  <span className="text-[11px] text-muted-foreground font-sans block">Pending Balance</span>
                                  <span className={`text-base font-bold font-sans ${isSettled ? 'text-green-600 flex items-center gap-1' : isLent ? 'text-green-600' : 'text-red-500'}`}>
                                    {isSettled ? (
                                      <>
                                        <CheckCircle className="h-4.5 w-4.5" /> Fully Settled
                                      </>
                                    ) : (
                                      `${currency} ${p.remaining.toLocaleString()}`
                                    )}
                                  </span>
                                </div>
                                {!isSettled && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => triggerRepayment(p)}
                                    className="font-sans text-xs border-primary/20  hover:bg-primary/5 py-1 px-3"
                                  >
                                    Log Repayment
                                  </Button>
                                )}
                              </div>

                              {/* Nested Repayments list */}
                              {p.repayments.length > 0 && (
                                <div className="mt-3 bg-muted/10 rounded-xl p-3 border border-muted/50 space-y-2">
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground font-sans block">
                                    Repayment History
                                  </span>
                                  <div className="divide-y divide-muted/40">
                                    {p.repayments.map((rep: any) => (
                                      <div key={rep._id} className="py-2 flex justify-between items-start text-xs font-sans first:pt-0 last:pb-0">
                                        <div>
                                          <span className="font-semibold text-foreground/90 block">
                                            {rep.notes || 'Settlement Repayment'}
                                          </span>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-muted-foreground">{rep.date}</span>
                                            {rep.receiptImage && rep.receiptImage !== 'null' && (
                                              <button
                                                onClick={() => {
                                                  setViewerUrl(getFileUrl(rep.receiptImage));
                                                  setViewerTitle(`Repayment Receipt`);
                                                  setIsViewerOpen(true);
                                                }}
                                                className="inline-flex items-center gap-0.5 text-primary hover:underline text-[9px] font-semibold bg-transparent border-0 cursor-pointer p-0"
                                              >
                                                <ImageIcon className="h-2.5 w-2.5" /> Receipt
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <span className="font-bold text-green-600 font-sans">
                                          +{currency} {rep.amount.toLocaleString()}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* General Repayments (unlinked fallback) */}
                {!isLoadingHistory && processedHistory.generalRepayments.length > 0 && (
                  <div className="space-y-3 text-left border-t pt-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      General / Unlinked Repayments
                    </h4>
                    <div className="border rounded-xl divide-y overflow-hidden bg-background/50">
                      {processedHistory.generalRepayments.map((tx: any) => (
                        <div key={tx._id} className="p-3 text-sm flex justify-between items-center hover:bg-muted/30">
                          <div>
                            <Badge variant="outline" className="text-[10px] uppercase font-mono mr-2 bg-green-500/10 text-green-600 border-green-500/20">
                              {tx.type.replace('_', ' ')}
                            </Badge>
                            <span className="font-semibold block sm:inline mt-1 sm:mt-0 font-sans">
                              General Payback
                            </span>
                            {tx.notes && (
                              <p className="text-xs text-muted-foreground mt-1 font-sans">{tx.notes}</p>
                            )}
                            {tx.receiptImage && tx.receiptImage !== 'null' && (
                              <button
                                onClick={() => {
                                  setViewerUrl(getFileUrl(tx.receiptImage));
                                  setViewerTitle(`Receipt: General Payback`);
                                  setIsViewerOpen(true);
                                }}
                                className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-[10px] font-sans mt-1.5 bg-transparent border-0 cursor-pointer p-0"
                              >
                                <ImageIcon className="h-3 w-3" /> View Receipt
                              </button>
                            )}
                          </div>
                          <div className="text-right font-sans">
                            <span className="font-bold text-green-600">
                              +{currency} {tx.amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">{tx.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex flex-col justify-center items-center py-20">
              <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-sans text-muted-foreground">Select a contact to view summary details.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Add Account Dialog */}
      <Dialog isOpen={isAddAccountOpen} onClose={() => setIsAddAccountOpen(false)} title="Add Ledger Contact">
        <form onSubmit={handleAccountSubmit(onSubmitAccount)} className="space-y-4 text-left">
          <Input
            label="Contact Name"
            placeholder="Person or Institution name"
            error={accErrors.name?.message}
            {...regAccount('name')}
          />
          <Input
            label="Phone Number"
            placeholder="Optional phone number"
            {...regAccount('phone')}
          />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" disabled={isSubmittingAccount}>
              {isSubmittingAccount ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} title="Log Ledger Entry">
        <form onSubmit={handleTxSubmit(onSubmitTx)} className="space-y-4 text-left">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium leading-none">Select Contact</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
              {...regTx('accountId')}
              onChange={(e) => setTxValue('accountId', e.target.value)}
            >
              <option value="">Select Account</option>
              {accounts.map((a: any) => (
                <option key={a.account._id} value={a.account._id}>
                  {a.account.name}
                </option>
              ))}
            </select>
            {txErrors.accountId && <p className="text-xs text-destructive font-medium">{txErrors.accountId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium leading-none">Type</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                {...regTx('type')}
              >
                <option value="borrowed">Borrowed (You receive cash)</option>
                <option value="lent">Lent (You give cash)</option>
                <option value="paid_borrow">Repayment to them (You pay back)</option>
                <option value="paid_lent">Repayment from them (They pay you)</option>
              </select>
            </div>
            <Input
              label="Amount"
              placeholder="0.00"
              error={txErrors.amount?.message}
              {...regTx('amount')}
            />
          </div>

          {(selectedTxType === 'paid_borrow' || selectedTxType === 'paid_lent') && (
            <div className="flex flex-col gap-1.5 w-full text-left">
              <label className="text-sm font-medium leading-none">Select Transaction to Repay</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                {...regTx('parentTransaction')}
                disabled={!!prefilledParentTxId}
              >
                <option value="">-- General Repayment (Unlinked) --</option>
                {selectedAccountId === activeAccount?.account._id &&
                  processedHistory.principals
                    .filter((p: any) => {
                      const matchType = selectedTxType === 'paid_borrow' ? 'borrowed' : 'lent';
                      return p.type === matchType && p.remaining > 0;
                    })
                    .map((p: any) => (
                      <option key={p._id} value={p._id}>
                        {p.type === 'borrowed' ? 'Borrowed' : 'Lent'} {currency} {p.amount} on {p.date} (Pending: {currency} {p.remaining})
                      </option>
                    ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Transaction Date"
              type="date"
              error={txErrors.date?.message}
              {...regTx('date')}
            />
            <Input
              label="Notes"
              placeholder="E.g. partial cash settlement"
              {...regTx('notes')}
            />
          </div>

          {/* Receipt upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Attach Receipt (Optional)</label>
            <div
              {...getRootProps()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent/30 transition-colors"
            >
              <input {...getInputProps()} />
              <ImageIcon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              {selectedFile ? (
                <span className="text-xs text-foreground font-semibold">{selectedFile.name}</span>
              ) : (
                <span className="text-xs text-muted-foreground font-sans">
                  Drag & drop invoice picture here
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" disabled={isSubmittingTx}>
              {isSubmittingTx ? 'Logging...' : 'Log Transaction'}
            </Button>
          </div>
        </form>
      </Dialog>

      <BillViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        fileUrl={viewerUrl}
        title={viewerTitle}
      />
    </div>
  );
};
export default Ledger;
